import { describe, expect, expectTypeOf, fnMock, test } from "@fabric/testing";
import { Field } from "../models/fields.js";

import { Effect } from "../../effect/effect.js";
import type { Infer } from "../models/index.js";
import { ValueStoreDriverMock } from "../value-store/value-store-driver-mock.js";
import { AggregateStore } from "./aggregate-store.js";
import { AggregateModel } from "./aggregate.js";
import { EventStore } from "./event-store.js";
import { EventStream } from "./event-stream.js";
import type { EventToType } from "./event.js";
import { DomainEvent } from "./event.js";
import { AggregateProjector } from "./projector.js";

describe("EventStore", async () => {
  const CreateStateEventModel = new DomainEvent("CreateStateEvent", {
    name: Field.string(),
  });
  type CreateStateEventModel = typeof CreateStateEventModel;
  type CreateStateEvent = EventToType<CreateStateEventModel>;

  const UpdateStateEventModel = new DomainEvent("UpdateStateEvent", {
    count: Field.integer({ hasArbitraryPrecision: false }),
  });
  type UpdateStateEventModel = typeof UpdateStateEventModel;
  type UpdateStateEvent = EventToType<UpdateStateEventModel>;

  const DeleteStateEvent = new DomainEvent("DeleteStateEvent", {});
  type DeleteStateEvent = typeof DeleteStateEvent;

  const events = [
    CreateStateEventModel,
    UpdateStateEventModel,
    DeleteStateEvent,
  ] as const;

  const StateAggregateModel = new AggregateModel("StateAggregateModel", {
    name: Field.string(),
    count: Field.integer({ hasArbitraryPrecision: false }),
  });
  type StateAggregateModel = typeof StateAggregateModel;
  type StateAggregate = Infer<StateAggregateModel>;

  const eventStream = new EventStream("StateAggregate", events);

  const StateAggregateProjector = new AggregateProjector(
    "StateAggregate",
    StateAggregateModel,
    events,
    {
      CreateStateEvent: (event: CreateStateEvent): StateAggregate =>
        StateAggregateModel.from(event, {
          name: event.payload.name,
          count: 0,
        }),
      UpdateStateEvent: (
        event: UpdateStateEvent,
        aggregate: StateAggregate,
      ): StateAggregate =>
        StateAggregateModel.update(aggregate, event, {
          count: event.payload.count,
        }),
      DeleteStateEvent: () => null,
    },
  );

  const eventStreams = [eventStream];

  const eventStore = new EventStore(new ValueStoreDriverMock(), eventStreams);

  const aggregateStore = new AggregateStore(
    new ValueStoreDriverMock(),
    eventStore,
    [StateAggregateProjector],
  );

  await aggregateStore.sync().runOrThrow();

  test("Given an aggregate store build from an event store and some projectors, when we call append, the aggregate store should be updated", async () => {
    const streamId = crypto.randomUUID();
    const createStateEvent = CreateStateEventModel.from({
      id: crypto.randomUUID(),
      streamId,
      version: 1,
      payload: { name: "test" },
    });

    const result = await eventStore
      .append("StateAggregate", createStateEvent)
      .runOrThrow();

    expectTypeOf(result.type).toEqualTypeOf<"CreateStateEvent">();

    const state = await aggregateStore
      .from("StateAggregateModel")
      .where({ id: streamId })
      .selectOneOrFail()
      .runOrThrow();

    expect(state).toEqual({
      id: streamId,
      name: "test",
      count: 0,
      createdAt: createStateEvent.timestamp,
      updatedAt: createStateEvent.timestamp,
      version: 1,
    });

    const updateStateEvent = UpdateStateEventModel.from({
      id: crypto.randomUUID(),
      streamId,
      version: 2,
      payload: { count: 1 },
    });

    await eventStore.append("StateAggregate", updateStateEvent).runOrThrow();

    const updatedState = await aggregateStore
      .from("StateAggregateModel")
      .where({ id: streamId })
      .selectOneOrFail()
      .runOrThrow();

    expect(updatedState).toEqual({
      id: streamId,
      name: "test",
      count: 1,
      createdAt: createStateEvent.timestamp,
      updatedAt: updateStateEvent.timestamp,
      version: 2,
    });

    const deleteStateEvent = DeleteStateEvent.from({
      id: crypto.randomUUID(),
      streamId,
      version: 3,
      payload: {},
    });

    await eventStore.append("StateAggregate", deleteStateEvent).runOrThrow();

    const deletedState = await aggregateStore
      .from("StateAggregateModel")
      .where({ id: streamId })
      .selectOne()
      .runOrThrow();

    expect(deletedState.isNothing()).toBe(true);
  });

  test("Given an event store with events, when replayAll is called, it should replay all events", async () => {
    const streamId = crypto.randomUUID();

    const localEventStore = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore.sync().runOrThrow();

    const createStateEvent = CreateStateEventModel.from({
      id: crypto.randomUUID(),
      streamId,
      version: 1,
      payload: { name: "test" },
    });

    const updateStateEvent = UpdateStateEventModel.from({
      id: crypto.randomUUID(),
      streamId,
      version: 2,
      payload: { count: 1 },
    });

    const deleteStateEvent = DeleteStateEvent.from({
      id: crypto.randomUUID(),
      streamId,
      version: 3,
      payload: {},
    });

    await localEventStore
      .append("StateAggregate", createStateEvent)
      .runOrThrow();
    await localEventStore
      .append("StateAggregate", updateStateEvent)
      .runOrThrow();
    await localEventStore
      .append("StateAggregate", deleteStateEvent)
      .runOrThrow();

    // Mock subscriber to verify replay behavior
    const mockSubscriber = fnMock(() => Effect.ok());

    localEventStore.subscribe("CreateStateEvent", mockSubscriber, {
      callOnReplay: true,
    });
    localEventStore.subscribe("UpdateStateEvent", mockSubscriber, {
      callOnReplay: true,
    });
    localEventStore.subscribe("DeleteStateEvent", mockSubscriber, {
      callOnReplay: true,
    });

    await localEventStore.replayAll().runOrThrow();

    expect(mockSubscriber).toHaveBeenCalledTimes(3);

    expect(mockSubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CreateStateEvent",
        payload: { name: "test" },
      }),
    );
  });
});
