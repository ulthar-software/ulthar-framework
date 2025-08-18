#!/usr/bin/env tsx

import "dotenv/config";

import { initializeEnvironment } from "../services/build-dependencies.js";
import {
  backupDatabases,
  cleanupWalFiles,
  recreateState,
  removeOldBackups,
  restoreDatabases,
} from "../utils/database-operations.js";

const COMMANDS = {
  backup: "backup",
  restore: "restore",
  cleanup: "cleanup",
  removeOldBackups: "removeOldBackups",
  replay: "replay",
} as const;

type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

function printUsage() {
  console.log("Usage: yarn db <command>");
  console.log("");
  console.log("Commands:");
  console.log(`  backup             - Create timestamped backup of events, state, and migrations databases
  restore            - Restore databases from the latest backup
  removeOldBackups   - Remove old backup files (keeps the latest backup of each database)
  cleanup            - Clean up WAL cache files for all databases
  recreateState      - Recreate the state database
  `);
  console.log("");
  console.log("Examples:");
  console.log("  yarn db backup");
  console.log("  yarn db restore");
  console.log("  yarn db removeOldBackups");
  console.log("  yarn db recreateState");
  console.log("  yarn db cleanup");
}

function isValidCommand(command: string): command is Command {
  return Object.values(COMMANDS).includes(command as Command);
}

async function main() {
  const command = process.argv[2];

  if (!command) {
    console.error("Error: No command specified");
    console.log("");
    printUsage();
    process.exit(1);
  }

  if (command === "help" || command === "--help" || command === "-h") {
    printUsage();
    process.exit(0);
  }

  if (!isValidCommand(command)) {
    console.error(`Error: Unknown command '${command}'`);
    console.log("");
    printUsage();
    process.exit(1);
  }

  const env = initializeEnvironment();

  try {
    switch (command) {
      case COMMANDS.backup:
        console.log("Creating database backups...");
        await backupDatabases(env);
        console.log("Database backups created successfully.");
        break;

      case COMMANDS.restore:
        console.log("Restoring databases from backup...");
        await restoreDatabases(env);
        console.log("Databases restored successfully.");
        break;

      case COMMANDS.cleanup:
        console.log("Cleaning up WAL cache...");
        await cleanupWalFiles(env);
        console.log("WAL cache cleaned up successfully.");
        break;

      case COMMANDS.removeOldBackups:
        console.log("Removing old database backups...");
        await removeOldBackups(env);
        console.log("Old database backups removed successfully.");
        break;

      case COMMANDS.replay:
        console.log("Replaying state...");
        await recreateState(env);
        console.log("State replayed successfully.");
        break;

      default:
        // This should never happen due to isValidCommand check
        console.error(`Error: Unhandled command '${String(command)}'`);
        process.exit(1);
    }
  } catch (error) {
    console.error(`Error executing command '${command}':`, error);
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error("Unexpected error:", error);
  process.exit(1);
});
