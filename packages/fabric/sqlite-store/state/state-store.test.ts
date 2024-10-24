import { Run } from "@fabric/core";
import { Field, isLike, Model } from "@fabric/domain";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { afterEach, beforeEach, describe, expect, test } from "@fabric/testing";
import { SQLiteStateStore } from "./state-store.ts";

describe("State Store", () => {
  const models = [
    Model.entityFrom("demo", {
      value: Field.float(),
      owner: Field.reference({ targetModel: "users" }),
      optional: Field.string({ isOptional: true }),
    }),
    Model.entityFrom("users", {
      name: Field.string(),
    }),
  ];

  let store: SQLiteStateStore<(typeof models)[number]>;

  beforeEach(async () => {
    store = new SQLiteStateStore(":memory:", models);
    await store.migrate().orThrow();
  });

  afterEach(async () => {
    await store.close().orThrow();
  });

  test("should insert a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users", {
      id: newUUID,
      name: "test",
    }).orThrow();
  });

  test("should select all records", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users", {
      name: "test",
      id: newUUID,
    }).orThrow();

    const result = await store.from("users").select().unwrapOrThrow();

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

  test("should select records with a filter", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Run.seqOrThrow(
      () =>
        store.insertInto("users", {
          name: "test",
          id: newUUID,
        }),
      () =>
        store.insertInto("users", {
          name: "anotherName",
          id: UUIDGeneratorMock.generate(),
        }),
      () =>
        store.insertInto("users", {
          name: "anotherName2",
          id: UUIDGeneratorMock.generate(),
        }),
    );

    const result = await store
      .from("users")
      .where({
        name: isLike("te%"),
      })
      .select().unwrapOrThrow();

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

    await store.insertInto("users", {
      name: "test",
      id: newUUID,
    }).orThrow();

    await store.update("users", newUUID, {
      name: "updated",
    }).orThrow();

    const result = await store.from("users").where({ id: newUUID }).selectOne()
      .unwrapOrThrow();

    expect(result).toEqual({
      id: newUUID,
      name: "updated",
    });
  });

  test("should delete a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users", {
      name: "test",
      id: newUUID,
    }).orThrow();

    await store.delete("users", newUUID).orThrow();

    const result = await store.from("users").where({ id: newUUID }).selectOne()
      .unwrapOrThrow();

    expect(result).toBeUndefined();
  });

  //test for inserting into a collection with a reference

  test("should insert a record with a reference", async () => {
    const newUUID = UUIDGeneratorMock.generate();
    const ownerUUID = UUIDGeneratorMock.generate();

    await store.insertInto("users", {
      id: ownerUUID,
      name: "test",
    }).orThrow();

    await store.insertInto("demo", {
      id: newUUID,
      value: 1.0,
      owner: ownerUUID,
    }).orThrow();
  });
});
