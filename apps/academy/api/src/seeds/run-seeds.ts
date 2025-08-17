import "dotenv/config";

import { Field, Model, WritableValueStore } from "@fabric/core";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import { initializeDependencies } from "../services/build-dependencies.js";
import {
  backupDatabases,
  removeBackups,
  restoreDatabases,
} from "../utils/database-operations.js";
import { getHashOfSeed } from "./get-hash-of-seed.js";
import { PROD_SEEDS } from "./prod-seeds.js";

const deps = initializeDependencies();

const SeedModel = new Model("seeds", {
  id: Field.integer({
    isUnique: true,
    isUnsigned: true,
  }),
  hash: Field.string(),
});
const seedStore = new SQLiteStoreDriver(deps.env.get("MIGRATIONS_DB"));
const store = new WritableValueStore(seedStore, [SeedModel]);

await backupDatabases(deps.env);

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

    await restoreDatabases(deps.env);

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

await removeBackups(deps.env);
