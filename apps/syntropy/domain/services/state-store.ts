import type { ReadonlyStateStore } from "@fabric/domain";
import type { DomainModels } from "../models/index.ts";

export type ReadStateStore = ReadonlyStateStore<DomainModels>;
