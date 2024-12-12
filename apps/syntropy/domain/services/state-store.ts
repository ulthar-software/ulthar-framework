import type { ReadonlyValueStore } from "@fabric/db";
import type { DomainModels } from "../models/index.ts";

export type ReadValueStore = ReadonlyValueStore<DomainModels>;
