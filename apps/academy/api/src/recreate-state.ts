import "dotenv/config";

import fs from "node:fs/promises";
import {
  initializeEnvironment,
  initializeStorage,
} from "./services/build-dependencies.js";

const env = initializeEnvironment();

const stateDBPath = env.get("STATE_DB");
await fs.rm(stateDBPath);

const { state } = initializeStorage(env);

await state.clearAndReplay().runOrThrow();
