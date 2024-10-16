import { PosixDate } from "@fabric/core";
import { Event } from "@fabric/domain";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  fn,
  test,
} from "@fabric/testing";
import { SQLiteEventStore } from "./event-store.ts";

describe("Event Store", () => {
  type UserCreated = Event<"UserCreated", { name: string }>;
  type UserUpdated = Event<"UserUpdated", { name: string }>;
  type UserDeleted = Event<"UserDeleted", void>;

  type UserEvents = UserCreated | UserUpdated | UserDeleted;

  let store: SQLiteEventStore<UserEvents>;

  beforeEach(async () => {
    store = new SQLiteEventStore(":memory:");
    await store.migrate().orThrow();
  });

  afterEach(async () => {
    await store.close().orThrow();
  });

  test("Should append an event", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    const userCreated: UserCreated = {
      _tag: "UserCreated",
      id: newUUID,
      streamId: newUUID,
      payload: { name: "test" },
    };

    await store.append(userCreated).orThrow();

    const events = await store.getEventsFromStream(newUUID).unwrapOrThrow();

    expect(events).toHaveLength(1);

    expect(events[0]).toEqual({
      id: newUUID,
      streamId: newUUID,
      _tag: "UserCreated",
      version: BigInt(1),
      timestamp: expect.any(PosixDate),
      payload: { name: "test" },
    });
  });

  test("should notify subscribers on append", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    const userCreated: UserCreated = {
      _tag: "UserCreated",
      id: newUUID,
      streamId: newUUID,
      payload: { name: "test" },
    };

    const subscriber = fn() as () => void;

    store.subscribe(["UserCreated"], subscriber);

    await store.append(userCreated).orThrow();

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith({
      id: newUUID,
      streamId: newUUID,
      _tag: "UserCreated",
      version: BigInt(1),
      timestamp: expect.any(PosixDate),
      payload: { name: "test" },
    });
  });
});
