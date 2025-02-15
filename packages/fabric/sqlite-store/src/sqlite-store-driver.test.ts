/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import {
  Effect,
  Field,
  isLike,
  Model,
  PosixDate,
  Run,
  WritableValueStore,
} from "@fabric/core";
import { afterEach, beforeEach, describe, expect, test } from "@fabric/testing";
import { SQLiteStoreDriver } from "./sqlite-store-driver.js";

describe("State Store", () => {
  const Demo = new Model("demo", {
    id: Field.uuid({ isPrimaryKey: true }),
    value: Field.float({}),
    owner: Field.reference({ targetModel: "users" }),
    optional: Field.string({ isOptional: true }),
  });

  const User = new Model("users", {
    id: Field.uuid({ isPrimaryKey: true }),
    name: Field.string({}),
  });

  const Events = new Model(
    "events",
    {
      _tag: Field.string(),
      streamId: Field.uuid(),
      id: Field.uuid({ isPrimaryKey: true }),
      version: Field.integer({ hasArbitraryPrecision: true }),
      payload: Field.embedded(),
      timestamp: Field.posixDate(),
    },
    {
      constraints: [{ type: "unique", fields: ["streamId", "version"] }],
    },
  );

  const DBSchema = [Demo, User, Events];

  let store: WritableValueStore<(typeof DBSchema)[number]>;

  beforeEach(async () => {
    const driver = new SQLiteStoreDriver(":memory:");
    store = new WritableValueStore(driver, DBSchema);
    await store.sync().runOrThrow();
  });

  afterEach(async () => {
    await store.close().runOrThrow();
  });

  test("should insert a record", async () => {
    const newId = crypto.randomUUID();

    await store
      .insertInto("users")
      .value({
        id: newId,
        name: "test",
      })
      .runOrThrow();
  });

  test("should select all records", async () => {
    const newId = crypto.randomUUID();

    await store
      .insertInto("users")
      .value({
        id: newId,
        name: "test",
      })
      .runOrThrow();

    const result = await store.from("users").select().runOrThrow();

    expect(result).toEqual([
      {
        id: newId,
        name: "test",
      },
    ]);
  });

  test("should select records with a filter", async () => {
    const newId = crypto.randomUUID();

    await store
      .insertInto("users")
      .manyValues([
        {
          name: "test",
          id: newId,
        },
        {
          name: "anotherName",
          id: crypto.randomUUID(),
        },
        {
          name: "anotherName2",
          id: crypto.randomUUID(),
        },
      ])
      .runOrThrow();

    const result = await store
      .from("users")
      .where({
        name: isLike("te%"),
      })
      .select()
      .runOrThrow();

    // expectTypeOf(result).toEqualTypeOf<
    //   {
    //     id: UUID;
    //     name: string;
    //   }[]
    // >();

    expect(result).toEqual([
      {
        id: newId,
        name: "test",
      },
    ]);
  });

  test("should update a record", async () => {
    const newId = crypto.randomUUID();

    await Effect.seq(
      () =>
        store.insertInto("users").value({
          name: "test",
          id: newId,
        }),
      () =>
        store.update("users").oneById(newId).set({
          name: "updated",
        }),
    ).runOrThrow();

    const result = await store
      .from("users")
      .where({ id: newId })
      .selectOne()
      .runOrThrow();

    expect(result.value).toEqual({
      id: newId,
      name: "updated",
    });
  });

  test("should delete a record", async () => {
    const newId = crypto.randomUUID();

    await Effect.seq(
      () =>
        store.insertInto("users").value({
          name: "test",
          id: newId,
        }),
      () => store.deleteFrom("users").oneById(newId),
    ).runOrThrow();

    const result = await store
      .from("users")
      .where({ id: newId })
      .selectOne()
      .runOrThrow();

    expect(result.isNothing()).toBeTruthy();
  });

  test("should insert a record with a reference", async () => {
    const newId = crypto.randomUUID();
    const ownerId = crypto.randomUUID();

    await Run.seqOrThrow(
      () =>
        store.insertInto("users").value({
          id: ownerId,
          name: "test",
        }),
      () =>
        store.insertInto("demo").value({
          id: newId,
          value: 1.0,
          owner: ownerId,
        }),
    );
  });

  test("should insert and retrieve an embedded field", async () => {
    const newId = crypto.randomUUID();
    await store
      .insertInto("events")
      .value({
        _tag: "CreateState",
        id: newId,
        streamId: crypto.randomUUID(),
        version: 0n,
        payload: {
          name: "test",
        },
        timestamp: new PosixDate(),
      })
      .runOrThrow();

    const retrievedEvent = await store
      .from("events")
      .where({ id: newId })
      .selectOne()
      .runOrThrow();

    expect(retrievedEvent.value).toEqual({
      _tag: "CreateState",
      id: newId,
      streamId: expect.any(String),
      version: 0n,
      payload: {
        name: "test",
      },
      timestamp: expect.any(PosixDate),
    });
  });

  test("should enforce custom constraints", async () => {
    const streamId = crypto.randomUUID();

    await store
      .insertInto("events")
      .value({
        _tag: "CreateState",
        id: crypto.randomUUID(),
        streamId,
        version: 0n,
        payload: {
          name: "test",
        },
        timestamp: new PosixDate(),
      })
      .runOrThrow();

    await expect(async () =>
      store
        .insertInto("events")
        .value({
          _tag: "CreateState",
          id: crypto.randomUUID(),
          streamId,
          version: 0n,
          payload: {
            name: "test",
          },
          timestamp: new PosixDate(),
        })
        .runOrThrow(),
    ).rejects.toThrow();

    const result = await store
      .from("events")
      .where({ streamId })
      .select()
      .runOrThrow();

    expect(result.length).toBe(1);
  });
});
