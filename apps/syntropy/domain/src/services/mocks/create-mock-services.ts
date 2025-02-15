import { EventStore, WritableValueStore } from "@fabric/core";
import { AuthServiceMock, CryptoServiceMock } from "@fabric/core/mocks";
import { SQLiteStoreDriver } from "@fabric/sqlite-store";
import { DomainModels, DomainStreams } from "../../models/index.js";
import type { User } from "../../models/user.js";
import type { DomainEventStore } from "../event-store.js";
import type { ReadValueStore } from "../state-store.js";

export interface Dependencies {
  state: ReadValueStore;
  events: DomainEventStore;
  crypto: CryptoServiceMock;
  auth: AuthServiceMock<User>;
}

export async function createMockServices(): Promise<Dependencies> {
  const state = new WritableValueStore(
    new SQLiteStoreDriver(":memory:"),
    DomainModels,
  );

  const events = new EventStore(
    new SQLiteStoreDriver(":memory:"),
    state,
    DomainStreams,
  );

  const crypto = new CryptoServiceMock();
  const auth = new AuthServiceMock<User>();

  await events.sync().run();

  return { state, events, crypto, auth };
}
