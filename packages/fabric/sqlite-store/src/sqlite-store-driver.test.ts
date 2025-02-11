import { Effect, Run } from "@fabric/core";
import { isLike, WritableValueStore } from "@fabric/db";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { Field, Model } from "@fabric/models";
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

  const DBSchema = [Demo, User];

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
    const newUuid = UUIDGeneratorMock.generate();

    await store
      .insertInto("users")
      .value({
        id: newUuid,
        name: "test",
      })
      .runOrThrow();
  });

  test("should select all records", async () => {
    const newUuid = UUIDGeneratorMock.generate();

    await store
      .insertInto("users")
      .value({
        id: newUuid,
        name: "test",
      })
      .runOrThrow();

    const result = await store.from("users").select().runOrThrow();

    expect(result).toEqual([
      {
        id: newUuid,
        name: "test",
      },
    ]);
  });

  test("should select records with a filter", async () => {
    const newUuid = UUIDGeneratorMock.generate();

    await store
      .insertInto("users")
      .manyValues([
        {
          name: "test",
          id: newUuid,
        },
        {
          name: "anotherName",
          id: UUIDGeneratorMock.generate(),
        },
        {
          name: "anotherName2",
          id: UUIDGeneratorMock.generate(),
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
        id: newUuid,
        name: "test",
      },
    ]);
  });

  test("should update a record", async () => {
    const newUuid = UUIDGeneratorMock.generate();

    await Effect.seq(
      () =>
        store.insertInto("users").value({
          name: "test",
          id: newUuid,
        }),
      () =>
        store.update("users").oneById(newUuid).set({
          name: "updated",
        }),
    ).runOrThrow();

    const result = await store
      .from("users")
      .where({ id: newUuid })
      .selectOne()
      .runOrThrow();

    expect(result.value).toEqual({
      id: newUuid,
      name: "updated",
    });
  });

  test("should delete a record", async () => {
    const newUuid = UUIDGeneratorMock.generate();

    await Effect.seq(
      () =>
        store.insertInto("users").value({
          name: "test",
          id: newUuid,
        }),
      () => store.deleteFrom("users").oneById(newUuid),
    ).runOrThrow();

    const result = await store
      .from("users")
      .where({ id: newUuid })
      .selectOne()
      .runOrThrow();

    expect(result.isNothing()).toBeTruthy();
  });

  test("should insert a record with a reference", async () => {
    const newUuid = UUIDGeneratorMock.generate();
    const ownerId = UUIDGeneratorMock.generate();

    await Run.seqOrThrow(
      () =>
        store.insertInto("users").value({
          id: ownerId,
          name: "test",
        }),
      () =>
        store.insertInto("demo").value({
          id: newUuid,
          value: 1.0,
          owner: ownerId,
        }),
    );
  });
});
