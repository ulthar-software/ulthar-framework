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

    localEventStore.subscribe(
      "StateAggregate",
      "CreateStateEvent",
      mockSubscriber,
      {
        callOnReplay: true,
      },
    );
    localEventStore.subscribe(
      "StateAggregate",
      "UpdateStateEvent",
      mockSubscriber,
      {
        callOnReplay: true,
      },
    );
    localEventStore.subscribe(
      "StateAggregate",
      "DeleteStateEvent",
      mockSubscriber,
      {
        callOnReplay: true,
      },
    );

    await localEventStore.replayAll().runOrThrow();

    expect(mockSubscriber).toHaveBeenCalledTimes(3);

    expect(mockSubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "CreateStateEvent",
        payload: { name: "test" },
      }),
    );
  });

  test("Given two event streams with events of the same name, when subscribing to events by name, subscribers should only be triggered for events from the correct stream", async () => {
    // Create a shared event type that will be used in both streams
    const UserCreatedEventModel = new DomainEvent("UserCreated", {
      name: Field.string(),
    });

    // Create two different event streams that both use the same event name
    const streamA = new EventStream("StreamA", [
      UserCreatedEventModel,
    ] as const);
    const streamB = new EventStream("StreamB", [
      UserCreatedEventModel,
    ] as const);

    const eventStreams = [streamA, streamB];
    const localEventStore = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore.sync().runOrThrow();

    // Create mock subscribers for each stream
    const streamASubscriber = fnMock(() => Effect.ok());
    const streamBSubscriber = fnMock(() => Effect.ok());

    // Subscribe to the same event name from both streams
    // In a correct implementation, we should be able to specify which stream we're subscribing to
    localEventStore.subscribe("StreamA", "UserCreated", streamASubscriber);
    localEventStore.subscribe("StreamB", "UserCreated", streamBSubscriber);

    // Create events for each stream
    const streamAEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Alice from Stream A" },
    });

    const streamBEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Bob from Stream B" },
    });

    // Append event to Stream A
    await localEventStore.append("StreamA", streamAEvent).runOrThrow();

    // only streamASubscriber should be called once.
    expect(streamASubscriber).toHaveBeenCalledTimes(1);
    expect(streamBSubscriber).toHaveBeenCalledTimes(0);

    // Create new mock subscribers to test the second stream
    const streamASubscriber2 = fnMock(() => Effect.ok());
    const streamBSubscriber2 = fnMock(() => Effect.ok());

    // Create a new event store to avoid interference
    const localEventStore2 = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore2.sync().runOrThrow();

    localEventStore2.subscribe("StreamA", "UserCreated", streamASubscriber2);
    localEventStore2.subscribe("StreamB", "UserCreated", streamBSubscriber2);

    // Append event to Stream B
    await localEventStore2.append("StreamB", streamBEvent).runOrThrow();

    // Again, both subscribers are called when only streamBSubscriber should be called
    expect(streamASubscriber2).toHaveBeenCalledTimes(0);
    expect(streamBSubscriber2).toHaveBeenCalledTimes(1);
  });

  test("Given two event streams with events of the same name and replay, subscribers should only be triggered for events from the correct stream during replay", async () => {
    // Create a shared event type that will be used in both streams
    const UserCreatedEventModel = new DomainEvent("UserCreated", {
      name: Field.string(),
    });

    // Create two different event streams that both use the same event name
    const streamA = new EventStream("StreamA", [
      UserCreatedEventModel,
    ] as const);
    const streamB = new EventStream("StreamB", [
      UserCreatedEventModel,
    ] as const);

    const eventStreams = [streamA, streamB];
    const localEventStore = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore.sync().runOrThrow();

    // Create events for each stream
    const streamAEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Alice from Stream A" },
    });

    const streamBEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Bob from Stream B" },
    });

    // Append events to both streams
    await localEventStore.append("StreamA", streamAEvent).runOrThrow();
    await localEventStore.append("StreamB", streamBEvent).runOrThrow();

    // Create mock subscribers for each stream that will be called on replay
    const streamASubscriber = fnMock(() => Effect.ok());
    const streamBSubscriber = fnMock(() => Effect.ok());

    // Subscribe to events with callOnReplay: true
    localEventStore.subscribe("StreamA", "UserCreated", streamASubscriber, {
      callOnReplay: true,
    });
    localEventStore.subscribe("StreamB", "UserCreated", streamBSubscriber, {
      callOnReplay: true,
    });

    // Replay all events
    await localEventStore.replayAll().runOrThrow();

    // This test should pass when the fix is implemented:
    // StreamA subscriber should only receive the StreamA event
    // StreamB subscriber should only receive the StreamB event
    expect(streamASubscriber).toHaveBeenCalledTimes(1);
    expect(streamBSubscriber).toHaveBeenCalledTimes(1);

    // Verify the correct events were received
    expect(streamASubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UserCreated",
        payload: { name: "Alice from Stream A" },
      }),
    );

    expect(streamBSubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UserCreated",
        payload: { name: "Bob from Stream B" },
      }),
    );
  });

  test("Given a wildcard subscription, when events are appended to different streams, the wildcard subscriber should be triggered for all events", async () => {
    // Create a shared event type that will be used in both streams
    const UserCreatedEventModel = new DomainEvent("UserCreated", {
      name: Field.string(),
    });

    // Create two different event streams that both use the same event name
    const streamA = new EventStream("StreamA", [
      UserCreatedEventModel,
    ] as const);
    const streamB = new EventStream("StreamB", [
      UserCreatedEventModel,
    ] as const);

    const eventStreams = [streamA, streamB];
    const localEventStore = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore.sync().runOrThrow();

    // Create mock subscribers
    const wildcardSubscriber = fnMock(() => Effect.ok());
    const streamASubscriber = fnMock(() => Effect.ok());

    // Subscribe with wildcard and specific stream
    localEventStore.subscribe("*", "UserCreated", wildcardSubscriber);
    localEventStore.subscribe("StreamA", "UserCreated", streamASubscriber);

    // Create events for each stream
    const streamAEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Alice from Stream A" },
    });

    const streamBEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Bob from Stream B" },
    });

    // Append event to Stream A
    await localEventStore.append("StreamA", streamAEvent).runOrThrow();

    // Both wildcard subscriber and specific stream subscriber should be called
    expect(wildcardSubscriber).toHaveBeenCalledTimes(1);
    expect(streamASubscriber).toHaveBeenCalledTimes(1);

    // Create new mocks for the second test
    const wildcardSubscriber2 = fnMock(() => Effect.ok());
    const streamASubscriber2 = fnMock(() => Effect.ok());

    // Create a new event store to avoid interference
    const localEventStore2 = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore2.sync().runOrThrow();

    localEventStore2.subscribe("*", "UserCreated", wildcardSubscriber2);
    localEventStore2.subscribe("StreamA", "UserCreated", streamASubscriber2);

    // Append event to Stream B
    await localEventStore2.append("StreamB", streamBEvent).runOrThrow();

    // Only wildcard subscriber should be called (no specific StreamB subscriber)
    expect(wildcardSubscriber2).toHaveBeenCalledTimes(1);
    expect(streamASubscriber2).toHaveBeenCalledTimes(0);

    // Verify the wildcard subscriber received the event
    expect(wildcardSubscriber2).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UserCreated",
        payload: { name: "Bob from Stream B" },
      }),
    );
  });

  test("Given wildcard subscriptions with replay, the wildcard subscriber should be triggered for events from all streams during replay", async () => {
    // Create a shared event type that will be used in both streams
    const UserCreatedEventModel = new DomainEvent("UserCreated", {
      name: Field.string(),
    });

    // Create two different event streams that both use the same event name
    const streamA = new EventStream("StreamA", [
      UserCreatedEventModel,
    ] as const);
    const streamB = new EventStream("StreamB", [
      UserCreatedEventModel,
    ] as const);

    const eventStreams = [streamA, streamB];
    const localEventStore = new EventStore(
      new ValueStoreDriverMock(),
      eventStreams,
    );
    await localEventStore.sync().runOrThrow();

    // Create events for each stream
    const streamAEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Alice from Stream A" },
    });

    const streamBEvent = UserCreatedEventModel.from({
      id: crypto.randomUUID(),
      streamId: crypto.randomUUID(),
      version: 1,
      payload: { name: "Bob from Stream B" },
    });

    // Append events to both streams
    await localEventStore.append("StreamA", streamAEvent).runOrThrow();
    await localEventStore.append("StreamB", streamBEvent).runOrThrow();

    // Create mock subscribers for replay
    const wildcardSubscriber = fnMock(() => Effect.ok());
    const streamASubscriber = fnMock(() => Effect.ok());

    // Subscribe with callOnReplay: true
    localEventStore.subscribe("*", "UserCreated", wildcardSubscriber, {
      callOnReplay: true,
    });
    localEventStore.subscribe("StreamA", "UserCreated", streamASubscriber, {
      callOnReplay: true,
    });

    // Replay all events
    await localEventStore.replayAll().runOrThrow();

    // Wildcard subscriber should receive both events
    expect(wildcardSubscriber).toHaveBeenCalledTimes(2);
    // StreamA subscriber should only receive StreamA event
    expect(streamASubscriber).toHaveBeenCalledTimes(1);

    // Verify the correct events were received
    expect(wildcardSubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UserCreated",
        payload: { name: "Alice from Stream A" },
      }),
    );

    expect(wildcardSubscriber).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "UserCreated",
        payload: { name: "Bob from Stream B" },
      }),
    );
  });
});
