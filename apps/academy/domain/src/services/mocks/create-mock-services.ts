import { AggregateStore, EventStore } from "@fabric/core";
import { TimeServiceMock } from "@fabric/core/mocks";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import { DomainProjectors, DomainStreams } from "../../models/index.js";
import type { DomainEventStore } from "../event-store.js";
import type { DomainStateStore } from "../state-store.js";
import { AuthServiceMock } from "./auth-service-mock.js";
import { CryptoServiceMock } from "./crypto-service-mock.js";

export interface MockedDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoServiceMock;
  auth: AuthServiceMock;
  time: TimeServiceMock;
}

export async function createServiceMocks(): Promise<MockedDependencies> {
  const events: DomainEventStore = new EventStore(
    new SQLiteStoreDriver(":memory:"),
    DomainStreams,
  );

  const state = new AggregateStore(
    new SQLiteStoreDriver(":memory:"),
    events,
    DomainProjectors,
  );

  const crypto = new CryptoServiceMock();
  const auth = new AuthServiceMock();
  const time = new TimeServiceMock();

  await state.sync().runOrThrow();

  return { state, events, crypto, auth, time };
}
