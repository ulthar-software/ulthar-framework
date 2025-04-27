import { EventStore } from "@fabric/core";
import type { DomainStreams } from "../models/index.js";

export type DomainEventStore = EventStore<typeof DomainStreams>;
export const DomainEventStore = EventStore<typeof DomainStreams>;
