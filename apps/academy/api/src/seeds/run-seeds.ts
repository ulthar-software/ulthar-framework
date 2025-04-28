import "dotenv/config";

import { Field, Model, WritableValueStore } from "@fabric/core";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import fs from "node:fs/promises";
import { dirname, join } from "node:path";
import { buildDependencies } from "../services/build-dependencies.js";
import { getHashOfSeed } from "./get-hash-of-seed.js";
import { PROD_SEEDS } from "./prod-seeds.js";

const deps = buildDependencies();

const SeedModel = new Model("seeds", {
  id: Field.integer({
    isUnique: true,
    isUnsigned: true,
  }),
  hash: Field.string(),
});
const seedStore = new SQLiteStoreDriver(deps.env.get("MIGRATIONS_DB"));
const store = new WritableValueStore(seedStore, [SeedModel]);

await backupDatabases();

try {
  await deps.state.sync().runOrThrow();
  await store.sync().runOrThrow();
} catch {
  //no-op
}

for (let i = 0; i < PROD_SEEDS.length; i++) {
  const seed = PROD_SEEDS[i];

  const maybeStoredSeed = await store
    .from("seeds")
    .where({ id: i + 1 })
    .selectOne()
    .runOrThrow();

  const seedHash = getHashOfSeed(seed);

  if (maybeStoredSeed.isValue()) {
    if (maybeStoredSeed.value.hash === seedHash) {
      console.log(`Seed ${i + 1} already run`);
      continue;
    } else {
      console.log(
        `Seed ${i + 1} already run but hash is different. Fix this before continuing.`,
      );
      process.exit(1);
    }
  }

  try {
    console.log(`Running seed ${i + 1}`);
    await seed(deps);
  } catch (e) {
    const error = e as Error;
    console.error(`Error running seed ${i + 1}: ${error}`);

    console.error("The database is in an inconsistent state. Restoring");

    deps.state.close();
    deps.events.close();

    await restoreDatabases();

    process.exit(1);
  }

  await store
    .insertInto("seeds")
    .value({
      id: i + 1,
      hash: seedHash,
    })
    .runOrThrow();

  console.log(`Seed ${i + 1} run successfully`);
}

console.log("All seeds run successfully");
console.log("Removing backups");

await removeBackups();

async function backupDatabases() {
  const migrationsDbDirectory = dirname(deps.env.get("MIGRATIONS_DB"));
  const migrationsEventsDbPath = join(
    migrationsDbDirectory,
    "migration-events-bkp.db",
  );
  const migrationsStateDbPath = join(
    migrationsDbDirectory,
    "migration-state-bkp.db",
  );
  if (
    (await fs.stat(migrationsEventsDbPath).catch(() => false)) ||
    (await fs.stat(migrationsStateDbPath).catch(() => false))
  ) {
    console.log("Backup already exists, skipping backup creation.");
    process.exit(1);
  }

  await fs.cp(deps.env.get("EVENTS_DB"), migrationsEventsDbPath);
  await fs.cp(deps.env.get("STATE_DB"), migrationsStateDbPath);
}

async function restoreDatabases() {
  const migrationsDbDirectory = dirname(deps.env.get("MIGRATIONS_DB"));
  const migrationsEventsDbPath = join(
    migrationsDbDirectory,
    "migration-events-bkp.db",
  );
  const migrationsStateDbPath = join(
    migrationsDbDirectory,
    "migration-state-bkp.db",
  );

  await fs.rm(deps.env.get("EVENTS_DB"));
  await fs.rm(deps.env.get("STATE_DB"));

  await fs.cp(migrationsEventsDbPath, deps.env.get("EVENTS_DB"));
  await fs.cp(migrationsStateDbPath, deps.env.get("STATE_DB"));
}

async function removeBackups() {
  const migrationsDbDirectory = dirname(deps.env.get("MIGRATIONS_DB"));
  const migrationsEventsDbPath = join(
    migrationsDbDirectory,
    "migration-events-bkp.db",
  );
  const migrationsStateDbPath = join(
    migrationsDbDirectory,
    "migration-state-bkp.db",
  );

  await fs.rm(migrationsEventsDbPath);
  await fs.rm(migrationsStateDbPath);
}
