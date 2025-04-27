import { AggregateStore } from "@fabric/core";
import type { DomainProjectors, DomainStreams } from "../models/index.js";

export type DomainStateStore = AggregateStore<
  typeof DomainProjectors,
  (typeof DomainProjectors)[number]["model"],
  typeof DomainStreams
>;

export const DomainStateStore = AggregateStore<
  typeof DomainProjectors,
  (typeof DomainProjectors)[number]["model"],
  typeof DomainStreams
>;
