import fs from "node:fs/promises";
import { dirname, join } from "node:path";
import type { ApiEnvironment } from "../environment.js";
import { initializeStorage } from "../services/build-dependencies.js";

export const EVENTS_BACKUP_DB_NAME = "events-bkp.db";
export const STATE_BACKUP_DB_NAME = "state-bkp.db";

export async function backupDatabases(env: ApiEnvironment) {
  const migrationsDbDirectory = dirname(env.get("MIGRATIONS_DB"));
  const eventsDbBackupPath = join(migrationsDbDirectory, EVENTS_BACKUP_DB_NAME);
  const stateDbBackupPath = join(migrationsDbDirectory, STATE_BACKUP_DB_NAME);
  if (
    (await fs.stat(eventsDbBackupPath).catch(() => false)) ||
    (await fs.stat(stateDbBackupPath).catch(() => false))
  ) {
    console.log("Backup already exists, skipping backup creation.");
    process.exit(1);
  }

  await fs.cp(env.get("EVENTS_DB"), eventsDbBackupPath);
  await fs.cp(env.get("STATE_DB"), stateDbBackupPath);
}

export async function restoreDatabases(env: ApiEnvironment) {
  const migrationsDbDirectory = dirname(env.get("MIGRATIONS_DB"));
  const eventsDbBackupPath = join(migrationsDbDirectory, EVENTS_BACKUP_DB_NAME);
  const stateDbBackupPath = join(migrationsDbDirectory, STATE_BACKUP_DB_NAME);

  await fs.rm(env.get("EVENTS_DB"));
  await fs.rm(env.get("STATE_DB"));

  await fs.cp(eventsDbBackupPath, env.get("EVENTS_DB"));
  await fs.cp(stateDbBackupPath, env.get("STATE_DB"));
}

export async function removeBackups(env: ApiEnvironment) {
  const migrationsDbDirectory = dirname(env.get("MIGRATIONS_DB"));
  const eventsDbBackupPath = join(migrationsDbDirectory, EVENTS_BACKUP_DB_NAME);
  const stateDbBackupPath = join(migrationsDbDirectory, STATE_BACKUP_DB_NAME);

  await fs.rm(eventsDbBackupPath);
  await fs.rm(stateDbBackupPath);
}

export async function recreateState(env: ApiEnvironment) {
  const stateDBPath = env.get("STATE_DB");
  await fs.rm(stateDBPath);

  const { state } = initializeStorage(env);

  await state.clearAndReplay().runOrThrow();
}
