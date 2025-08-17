#!/usr/bin/env tsx

import "dotenv/config";

import { initializeEnvironment } from "../services/build-dependencies.js";
import {
  backupDatabases,
  recreateState,
  removeBackups,
  restoreDatabases,
} from "../utils/database-operations.js";

const COMMANDS = {
  backup: "backup",
  restore: "restore",
  clear: "clear",
  replay: "replay",
} as const;

type Command = (typeof COMMANDS)[keyof typeof COMMANDS];

function printUsage() {
  console.log("Usage: tsx src/scripts/db-ops.ts <command>");
  console.log("");
  console.log("Commands:");
  console.log("  backup         - Create backup of events and state databases");
  console.log("  restore        - Restore databases from backup");
  console.log("  clear          - Remove backup files");
  console.log("");
  console.log("Examples:");
  console.log("  tsx src/scripts/db-ops.ts backup");
  console.log("  tsx src/scripts/db-ops.ts restore");
  console.log("  tsx src/scripts/db-ops.ts clear");
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

      case COMMANDS.clear:
        console.log("Removing database backups...");
        await removeBackups(env);
        console.log("Database backups removed successfully.");
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
