import { PosixDate, Run } from "@fabric/core";
import { Event } from "@fabric/domain";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { afterEach, beforeEach, describe, expect, it, vitest } from "vitest";
import { SQLiteEventStore } from "./event-store.js";

describe("Event Store", () => {
  type UserCreated = Event<"UserCreated", { name: string }>;
  type UserUpdated = Event<"UserUpdated", { name: string }>;
  type UserDeleted = Event<"UserDeleted", void>;

  type UserEvents = UserCreated | UserUpdated | UserDeleted;

  let store: SQLiteEventStore<UserEvents>;

  beforeEach(async () => {
    store = new SQLiteEventStore(":memory:");
    await Run.UNSAFE(() => store.migrate());
  });

  afterEach(async () => {
    await Run.UNSAFE(() => store.close());
  });

  it("Should append an event", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    const userCreated: UserCreated = {
      type: "UserCreated",
      id: newUUID,
      streamId: newUUID,
      payload: { name: "test" },
    };

    await Run.UNSAFE(() => store.append(userCreated));

    const events = await Run.UNSAFE(() => store.getEventsFromStream(newUUID));

    expect(events).toHaveLength(1);

    expect(events[0]).toEqual({
      id: newUUID,
      streamId: newUUID,
      type: "UserCreated",
      version: BigInt(1),
      timestamp: expect.any(PosixDate),
      payload: { name: "test" },
    });
  });

  it("should notify subscribers on append", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    const userCreated: UserCreated = {
      type: "UserCreated",
      id: newUUID,
      streamId: newUUID,
      payload: { name: "test" },
    };

    const subscriber = vitest.fn();

    store.subscribe(["UserCreated"], subscriber);

    await Run.UNSAFE(() => store.append(userCreated));

    expect(subscriber).toHaveBeenCalledTimes(1);
    expect(subscriber).toHaveBeenCalledWith({
      id: newUUID,
      streamId: newUUID,
      type: "UserCreated",
      version: BigInt(1),
      timestamp: expect.any(PosixDate),
      payload: { name: "test" },
    });
  });
});
