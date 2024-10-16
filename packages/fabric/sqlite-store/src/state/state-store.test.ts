import { PosixDate, Run } from "@fabric/core";
import { defineModel, Field, isLike, UUID } from "@fabric/domain";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  test,
} from "@fabric/testing";
import { SQLiteStateStore } from "./state-store.ts";

describe("State Store", () => {
  const models = [
    defineModel("demo", {
      value: Field.float(),
      owner: Field.reference({ targetModel: "users" }),
    }),
    defineModel("users", {
      name: Field.string(),
    }),
  ];

  let store: SQLiteStateStore<(typeof models)[number]>;

  beforeEach(async () => {
    store = new SQLiteStateStore(":memory:", models);
    await Run.UNSAFE(() => store.migrate());
  });

  afterEach(async () => {
    await Run.UNSAFE(() => store.close());
  });

  test("should insert a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Run.UNSAFE(() =>
      store.insertInto("users", {
        id: newUUID,
        name: "test",
        streamId: newUUID,
        streamVersion: 1n,
        deletedAt: null,
      })
    );
  });

  test("should select all records", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Run.UNSAFE(() =>
      store.insertInto("users", {
        name: "test",
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        deletedAt: null,
      })
    );

    const result = await Run.UNSAFE(() => store.from("users").select());

    expectTypeOf(result).toEqualTypeOf<
      {
        id: UUID;
        streamId: UUID;
        streamVersion: bigint;
        name: string;
        deletedAt: PosixDate | null;
      }[]
    >();

    expect(result).toEqual([
      {
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        name: "test",
        deletedAt: null,
      },
    ]);
  });

  test("should select records with a filter", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Run.seqUNSAFE(
      () =>
        store.insertInto("users", {
          name: "test",
          id: newUUID,
          streamId: newUUID,
          streamVersion: 1n,
          deletedAt: null,
        }),
      () =>
        store.insertInto("users", {
          name: "anotherName",
          id: UUIDGeneratorMock.generate(),
          streamId: UUIDGeneratorMock.generate(),
          streamVersion: 1n,
          deletedAt: null,
        }),
      () =>
        store.insertInto("users", {
          name: "anotherName2",
          id: UUIDGeneratorMock.generate(),
          streamId: UUIDGeneratorMock.generate(),
          streamVersion: 1n,
          deletedAt: null,
        }),
    );

    const result = await Run.UNSAFE(() =>
      store
        .from("users")
        .where({
          name: isLike("te%"),
        })
        .select()
    );

    expectTypeOf(result).toEqualTypeOf<
      {
        id: UUID;
        streamId: UUID;
        streamVersion: bigint;
        name: string;
        deletedAt: PosixDate | null;
      }[]
    >();

    expect(result).toEqual([
      {
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        name: "test",
        deletedAt: null,
      },
    ]);
  });

  test("should update a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Run.UNSAFE(() =>
      store.insertInto("users", {
        name: "test",
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        deletedAt: null,
      })
    );

    await Run.UNSAFE(() =>
      store.update("users", newUUID, {
        name: "updated",
      })
    );

    const result = await Run.UNSAFE(() =>
      store.from("users").where({ id: newUUID }).selectOne()
    );

    expect(result).toEqual({
      id: newUUID,
      streamId: newUUID,
      streamVersion: 1n,
      name: "updated",
      deletedAt: null,
    });
  });

  test("should delete a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();

    await Run.UNSAFE(() =>
      store.insertInto("users", {
        name: "test",
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        deletedAt: null,
      })
    );

    await Run.UNSAFE(() => store.delete("users", newUUID));

    const result = await Run.UNSAFE(() =>
      store.from("users").where({ id: newUUID }).selectOne()
    );

    expect(result).toBeUndefined();
  });

  //test for inserting into a collection with a reference

  test("should insert a record with a reference", async () => {
    const newUUID = UUIDGeneratorMock.generate();
    const ownerUUID = UUIDGeneratorMock.generate();

    await Run.UNSAFE(() =>
      store.insertInto("users", {
        id: ownerUUID,
        name: "test",
        streamId: ownerUUID,
        streamVersion: 1n,
        deletedAt: null,
      })
    );

    await Run.UNSAFE(() =>
      store.insertInto("demo", {
        id: newUUID,
        value: 1.0,
        owner: ownerUUID,
        streamId: newUUID,
        streamVersion: 1n,
        deletedAt: null,
      })
    );
  });
});
