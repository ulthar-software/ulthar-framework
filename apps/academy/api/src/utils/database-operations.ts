import Database from "better-sqlite3";
import fs from "node:fs/promises";
import { join } from "node:path";
import type { ApiEnvironment } from "../environment.js";
import { initializeStorage } from "../services/build-dependencies.js";

function getTimestamp(): string {
  return new Date().toISOString().replace(/[:.]/g, "-").slice(0, -5);
}

function getBackupFileName(dbType: string, timestamp: string): string {
  return `${dbType}-${timestamp}.db`;
}

export async function backupDatabases(env: ApiEnvironment) {
  const backupsDirectory = env.get("BACKUPS_DIRECTORY");
  const timestamp = getTimestamp();

  // Ensure backups directory exists
  await fs.mkdir(backupsDirectory, { recursive: true });

  // Create backup file names with timestamp
  const eventsBackupPath = join(
    backupsDirectory,
    getBackupFileName("events", timestamp),
  );
  const stateBackupPath = join(
    backupsDirectory,
    getBackupFileName("state", timestamp),
  );
  const migrationsBackupPath = join(
    backupsDirectory,
    getBackupFileName("migrations", timestamp),
  );

  // Copy database files to backup location
  await fs.cp(env.get("EVENTS_DB"), eventsBackupPath);
  await fs.cp(env.get("STATE_DB"), stateBackupPath);
  await fs.cp(env.get("MIGRATIONS_DB"), migrationsBackupPath);
}

async function getLatestBackupFiles(backupsDirectory: string) {
  const files = await fs.readdir(backupsDirectory);

  // Filter files by database type and extract timestamps
  const eventsFiles = files.filter(
    (f) => f.startsWith("events-") && f.endsWith(".db"),
  );
  const stateFiles = files.filter(
    (f) => f.startsWith("state-") && f.endsWith(".db"),
  );
  const migrationsFiles = files.filter(
    (f) => f.startsWith("migrations-") && f.endsWith(".db"),
  );

  // Get the latest file for each type (files should be sorted by timestamp in name)
  const latestEvents = eventsFiles.sort().pop();
  const latestState = stateFiles.sort().pop();
  const latestMigrations = migrationsFiles.sort().pop();

  if (!latestEvents || !latestState || !latestMigrations) {
    throw new Error(
      "Could not find complete backup set (events, state, and migrations databases)",
    );
  }

  return {
    events: join(backupsDirectory, latestEvents),
    state: join(backupsDirectory, latestState),
    migrations: join(backupsDirectory, latestMigrations),
  };
}

export async function restoreDatabases(env: ApiEnvironment) {
  const backupsDirectory = env.get("BACKUPS_DIRECTORY");
  const latestBackups = await getLatestBackupFiles(backupsDirectory);

  // Remove existing databases
  await fs.rm(env.get("EVENTS_DB"));
  await fs.rm(env.get("STATE_DB"));
  await fs.rm(env.get("MIGRATIONS_DB"));

  // Restore from latest backups
  await fs.cp(latestBackups.events, env.get("EVENTS_DB"));
  await fs.cp(latestBackups.state, env.get("STATE_DB"));
  await fs.cp(latestBackups.migrations, env.get("MIGRATIONS_DB"));
}

export async function removeOldBackups(env: ApiEnvironment) {
  const backupsDirectory = env.get("BACKUPS_DIRECTORY");
  const files = await fs.readdir(backupsDirectory);

  // Group files by database type and sort by timestamp (newest first)
  const eventsFiles = files
    .filter((f) => f.startsWith("events-") && f.endsWith(".db"))
    .sort()
    .reverse();
  const stateFiles = files
    .filter((f) => f.startsWith("state-") && f.endsWith(".db"))
    .sort()
    .reverse();
  const migrationsFiles = files
    .filter((f) => f.startsWith("migrations-") && f.endsWith(".db"))
    .sort()
    .reverse();

  // Remove all but the latest backup for each database type
  const filesToRemove = [
    ...eventsFiles.slice(1), // Keep first (latest), remove rest
    ...stateFiles.slice(1),
    ...migrationsFiles.slice(1),
  ];

  for (const file of filesToRemove) {
    await fs.rm(join(backupsDirectory, file));
  }
}

export async function recreateState(env: ApiEnvironment) {
  const stateDBPath = env.get("STATE_DB");
  await fs.rm(stateDBPath);

  const { state } = initializeStorage(env);

  await state.clearAndReplay().runOrThrow();
}

export async function cleanupWalFiles(env: ApiEnvironment) {
  const dbPaths = [
    env.get("EVENTS_DB"),
    env.get("STATE_DB"),
    env.get("MIGRATIONS_DB"),
  ];

  for (const dbPath of dbPaths) {
    try {
      // Check if main database file exists
      await fs.access(dbPath);

      // Open connection to force SQLite to checkpoint WAL files
      const db = new Database(dbPath);

      // Force checkpoint to write WAL back to main file
      db.pragma("wal_checkpoint(TRUNCATE)");

      // Close the connection
      db.close();

      // Clean up any remaining -shm and -wal files
      const shmFile = `${dbPath}-shm`;
      const walFile = `${dbPath}-wal`;

      try {
        await fs.rm(shmFile);
      } catch {
        // File might not exist, ignore error
      }

      try {
        await fs.rm(walFile);
      } catch {
        // File might not exist, ignore error
      }
    } catch (error) {
      // Database file might not exist, skip
      console.warn(`Could not cleanup WAL files for ${dbPath}:`, error);
    }
  }
}
