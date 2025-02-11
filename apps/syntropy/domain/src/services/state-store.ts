import type { ReadonlyValueStore } from "@fabric/db";
import type { DomainModels } from "../models/index.js";

export type ReadValueStore = ReadonlyValueStore<DomainModels>;
