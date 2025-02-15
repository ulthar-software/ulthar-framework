import type { EventStore } from "@fabric/core";
import type {
  DomainModels,
  DomainStreams,
  ProjectEvents,
} from "../models/index.js";

export type DomainEvents = ProjectEvents;

export type DomainEventStore = EventStore<DomainModels, DomainStreams>;
