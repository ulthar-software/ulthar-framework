import { PosixDate } from "@fabric/core";
import { DomainEvent } from "@fabric/domain";
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
  type UserCreated = DomainEvent<"UserCreated", { name: string }>;
  type UserUpdated = DomainEvent<"UserUpdated", { name: string }>;
  type UserDeleted = DomainEvent<"UserDeleted", void>;

  type UserEvents = UserCreated | UserUpdated | UserDeleted;

  let store: SQLiteEventStore<UserEvents>;

  beforeEach(async () => {
    store = new SQLiteEventStore(":memory:");
    await store.migrate().runOrThrow();
  });

  afterEach(async () => {
    await store.close().runOrThrow();
  });

  test("Should append an event", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    const userCreated: UserCreated = {
      _tag: "UserCreated",
      id: newUUID,
      streamId: newUUID,
      payload: { name: "test" },
    };

    await store.append(userCreated).runOrThrow();

    const events = await store.getEventsFromStream(newUUID).runOrThrow();

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

    await store.append(userCreated).runOrThrow();

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
