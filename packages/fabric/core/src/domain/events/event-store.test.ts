/* eslint-disable @typescript-eslint/no-unsafe-assignment */

import { beforeEach, describe, expect, test } from "@fabric/testing";
import { Field } from "../models/fields.js";
import { WritableValueStore } from "../value-store/value-store.js";
import { AggregateModel } from "./aggregate.js";
import { EventStore } from "./event-store.js";
import { EventStream } from "./event-stream.js";
import type { DomainEvent } from "./event.js";

import { PosixDate } from "../../time/posix-date.js";
import { ValueStoreDriverMock } from "../value-store/value-store-driver-mock.js";

describe("EventStore", () => {
  const stateModel = new AggregateModel("demo", {
    name: Field.string({
      isUnique: true,
    }),
    count: Field.integer(),
  });
  type StateModel = typeof stateModel;
  type CreateStateEvent = DomainEvent<"CreateState", { name: string }>;
  type UpdateStateEvent = DomainEvent<"UpdateState", { count: number }>;
  // type DeleteStateEvent = DomainEvent<"DeleteState">;

  const demoStream = new EventStream(
    stateModel,
    {
      createEvents: ["CreateState"],
      updateEvents: ["UpdateState"],
      deleteEvents: ["DeleteState"],
    },
    {
      create: (evt: CreateStateEvent) => {
        return {
          id: crypto.randomUUID(),
          version: 0n,
          createdAt: new PosixDate(),
          updatedAt: new PosixDate(),
          name: evt.payload.name,
          count: 0,
        };
      },
      update: (evt: UpdateStateEvent, model) => {
        return {
          ...model,
          count: evt.payload.count,
          updatedAt: new PosixDate(),
        };
      },
    },
  );
  type DemoStream = typeof demoStream;

  let eventStore: EventStore<StateModel, DemoStream>;

  beforeEach(async () => {
    const eventStorageDriver = new ValueStoreDriverMock();
    const stateStorageDriver = new ValueStoreDriverMock();
    const stateStore = new WritableValueStore(stateStorageDriver, [stateModel]);

    eventStore = new EventStore(eventStorageDriver, stateStore, [demoStream]);

    await eventStore.sync().runOrThrow();
  });
  test("given an event store, we can append events to it", async () => {
    await eventStore
      .append("demo", {
        _tag: "CreateState",
        id: crypto.randomUUID(),
        payload: {
          name: "test",
        },
        streamId: crypto.randomUUID(),
        version: 1n,
        timestamp: new PosixDate(),
      })
      .runOrThrow();

    const state = await eventStore.stateStore
      .from("demo")
      .selectOneOrFail()
      .runOrThrow();

    expect(state).toEqual({
      id: expect.any(String),
      version: 0n,
      createdAt: expect.any(PosixDate),
      updatedAt: expect.any(PosixDate),
      name: "test",
      count: 0,
    });
  });
});
