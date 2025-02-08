import { Effect, Run } from "@fabric/core";
import { isLike, WritableValueStore } from "@fabric/db";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { Field, Model } from "@fabric/models";
import { afterEach, beforeEach, describe, expect, test } from "@fabric/testing";
import { SQLiteStoreDriver } from "./sqlite-store-driver.ts";

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

  let store: WritableValueStore<typeof DBSchema[number]>;

  beforeEach(async () => {
    const driver = new SQLiteStoreDriver(":memory:");
    store = new WritableValueStore(driver, DBSchema);
    await store.sync().runOrThrow();
  });

  afterEach(async () => {
    await store.close().runOrThrow();
  });

  test("should insert a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users").value({
      id: newUUID,
      name: "test",
    }).runOrThrow();
  });

  test("should select all records", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users").value({
      id: newUUID,
      name: "test",
    }).runOrThrow();

    const result = await store
      .from("users")
      .select()
      .runOrThrow();

    expect(result).toEqual([
      {
        id: newUUID,
        name: "test",
      },
    ]);
  });

  test("should select records with a filter", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users").manyValues([
      {
        name: "test",
        id: newUUID,
      },
      {
        name: "anotherName",
        id: UUIDGeneratorMock.generate(),
      },
      {
        name: "anotherName2",
        id: UUIDGeneratorMock.generate(),
      },
    ]).runOrThrow();

    const result = await store
      .from("users")
      .where({
        name: isLike("te%"),
      })
      .select().runOrThrow();

    // expectTypeOf(result).toEqualTypeOf<
    //   {
    //     id: UUID;
    //     name: string;
    //   }[]
    // >();

    expect(result).toEqual([
      {
        id: newUUID,
        name: "test",
      },
    ]);
  });

  test("should update a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Effect.seq(
      () =>
        store.insertInto("users").value({
          name: "test",
          id: newUUID,
        }),
      () =>
        store.update("users")
          .oneById(newUUID)
          .set({
            name: "updated",
          }),
    ).runOrThrow();

    const result = await store.from("users")
      .where({ id: newUUID })
      .selectOne()
      .runOrThrow();

    expect(result.value).toEqual({
      id: newUUID,
      name: "updated",
    });
  });

  test("should delete a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Effect.seq(
      () =>
        store.insertInto("users")
          .value({
            name: "test",
            id: newUUID,
          }),
      () =>
        store.deleteFrom("users")
          .oneById(newUUID),
    ).runOrThrow();

    const result = await store.from("users")
      .where({ id: newUUID })
      .selectOne()
      .runOrThrow();

    expect(result.isNothing()).toBeTruthy();
  });

  test("should insert a record with a reference", async () => {
    const newUUID = UUIDGeneratorMock.generate();
    const ownerUUID = UUIDGeneratorMock.generate();

    await Run.seqOrThrow(
      () =>
        store.insertInto("users").value({
          id: ownerUUID,
          name: "test",
        }),
      () =>
        store.insertInto("demo").value({
          id: newUUID,
          value: 1.0,
          owner: ownerUUID,
        }),
    );
  });
});
