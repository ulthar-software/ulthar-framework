import { AggregateStore, EventStore } from "@fabric/core";
import { AuthServiceMock, CryptoServiceMock } from "@fabric/core/mocks";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import { DomainProjectors, DomainStreams } from "../../models/index.js";
import type { User } from "../../models/user.js";
import type { DomainEventStore } from "../event-store.js";
import type { DomainStateStore } from "../state-store.js";

export interface MockedDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoServiceMock;
  auth: AuthServiceMock<User>;
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
  const auth = new AuthServiceMock<User>();

  await state.sync().runOrThrow();

  return { state, events, crypto, auth };
}
