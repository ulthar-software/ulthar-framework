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

  const NonReferenceModel = new Model("nonReferenceModel", {
    id: Field.uuid({ isPrimaryKey: true }),
    value: Field.float({}),
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
      payload: Field.embedded({
        name: Field.string(),
      }),
      timestamp: Field.posixDate(),
    },
    {
      constraints: [{ type: "unique", fields: ["streamId", "version"] }],
    },
  );

  const DBSchema = [Demo, User, Events, NonReferenceModel];

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

  test("should count records", async () => {
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
        name: isLike("an%"),
      })
      .count()
      .runOrThrow();

    expect(result).toBe(2);
  });

  test("should find the maximum value", async () => {
    await store
      .insertInto("nonReferenceModel")
      .manyValues([
        {
          id: crypto.randomUUID(),
          value: 10.5,
        },
        {
          id: crypto.randomUUID(),
          value: 25.7,
        },
        {
          id: crypto.randomUUID(),
          value: 5.2,
        },
      ])
      .runOrThrow();

    const result = await store
      .from("nonReferenceModel")
      .max("value")
      .runOrThrow();

    expect(result).toBe(25.7);
  });

  test("should select distinct values", async () => {
    // Insert test data with duplicate values
    await store
      .insertInto("nonReferenceModel")
      .manyValues([
        {
          id: crypto.randomUUID(),
          value: 10.5,
          optional: "category1",
        },
        {
          id: crypto.randomUUID(),
          value: 25.7,
          optional: "category2",
        },
        {
          id: crypto.randomUUID(),
          value: 15.3,
          optional: "category1",
        },
        {
          id: crypto.randomUUID(),
          value: 30.0,
          optional: "category2",
        },
      ])
      .runOrThrow();

    // Test selectDistinct on a single field
    const distinctCategories = await store
      .from("nonReferenceModel")
      .selectDistinct(["optional"])
      .runOrThrow();

    // Should have exactly 2 distinct values for 'optional' field
    expect(distinctCategories.length).toBe(2);
    expect(distinctCategories).toEqual(
      expect.arrayContaining([
        { optional: "category1" },
        { optional: "category2" },
      ]),
    );

    // Test with a where condition
    const filteredDistinct = await store
      .from("nonReferenceModel")
      .where({ optional: "category1" })
      .selectDistinct(["optional"])
      .runOrThrow();

    expect(filteredDistinct.length).toBe(1);
    expect(filteredDistinct[0].optional).toBe("category1");
  });

  test("should perform joins when specified in query options", async () => {
    const userId = crypto.randomUUID();
    const demoId = crypto.randomUUID();

    // Insert test data
    await Run.seqOrThrow(
      () =>
        store.insertInto("users").value({
          id: userId,
          name: "test user",
        }),
      () =>
        store.insertInto("demo").value({
          id: demoId,
          value: 42.0,
          owner: userId,
        }),
    );

    // Test joins using store API directly, similar to other tests
    const joinedResult = await store
      .from("demo")
      .leftJoin({
        model: User,
        as: "u",
        on: {
          left: "owner",
          right: "id",
        },
      })
      .select()
      .runOrThrow();

    // Check that we got a result with joined data
    expect(joinedResult.length).toBe(1);
    expect(joinedResult[0]).toMatchObject({
      id: demoId,
      value: 42.0,
      owner: userId,
      "u.id": userId,
      "u.name": "test user",
    });

    // Test with select specific fields
    const specificFields = await store
      .from("demo")
      .leftJoin({
        model: User,
        as: "u",
        on: {
          left: "owner",
          right: "id",
        },
      })
      .select(["id", "value", "u.name"])
      .runOrThrow();

    // Check that we got only the requested fields
    expect(specificFields.length).toBe(1);
    expect(specificFields[0]).toMatchObject({
      id: demoId,
      value: 42.0,
      "u.name": "test user",
    });

    //@ts-expect-error owner is not in the selected fields
    expect(specificFields[0].owner).toBeUndefined();
    //@ts-expect-error owner is not in the selected fields
    expect(specificFields[0]["user.id"]).toBeUndefined();
  });
});
