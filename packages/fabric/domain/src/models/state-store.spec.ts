import { isError } from "@fabric/core";
import { SQLiteStorageDriver } from "@fabric/store-sqlite";
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  expectTypeOf,
  it,
} from "vitest";
import { UUIDGeneratorMock } from "../services/uuid-generator.mock.js";
import { UUID } from "../types/uuid.js";
import { Field } from "./fields/index.js";
import { defineModel } from "./model.js";
import { isLike } from "./query/filter-options.js";
import { StateStore } from "./state-store.js";

describe("State Store", () => {
  const models = [
    defineModel("users", {
      name: Field.string(),
    }),
  ];

  let driver: SQLiteStorageDriver;
  let store: StateStore<(typeof models)[number]>;

  beforeEach(async () => {
    driver = new SQLiteStorageDriver(":memory:");
    store = new StateStore(driver, models);
    const migrationResult = await store.migrate();
    if (isError(migrationResult)) throw migrationResult;
  });

  afterEach(async () => {
    await driver.close();
  });

  it("should insert a record", async () => {
    const newUUID = UUIDGeneratorMock.generate();
    const insertResult = await store.insertInto("users", {
      name: "test",
      id: newUUID,
      streamId: newUUID,
      streamVersion: 1n,
    });
    if (isError(insertResult)) throw insertResult;
  });

  it("should query with a basic select", async () => {
    const newUUID = UUIDGeneratorMock.generate();
    const insertResult = await store.insertInto("users", {
      name: "test",
      id: newUUID,
      streamId: newUUID,
      streamVersion: 1n,
    });

    if (isError(insertResult)) throw insertResult;

    const result = await store.from("users").select();

    if (isError(result)) throw result;

    expectTypeOf(result).toEqualTypeOf<
      {
        id: UUID;
        streamId: UUID;
        streamVersion: bigint;
        name: string;
      }[]
    >();

    expect(result).toEqual([
      {
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        name: "test",
      },
    ]);
  });

  it("should query with a where clause", async () => {
    const newUUID = UUIDGeneratorMock.generate();
    await store.insertInto("users", {
      name: "test",
      id: newUUID,
      streamId: newUUID,
      streamVersion: 1n,
    });

    await store.insertInto("users", {
      name: "anotherName",
      id: UUIDGeneratorMock.generate(),
      streamId: UUIDGeneratorMock.generate(),
      streamVersion: 1n,
    });
    await store.insertInto("users", {
      name: "anotherName2",
      id: UUIDGeneratorMock.generate(),
      streamId: UUIDGeneratorMock.generate(),
      streamVersion: 1n,
    });

    const result = await store
      .from("users")
      .where({
        name: isLike("te*"),
      })
      .select();

    if (isError(result)) throw result;

    expectTypeOf(result).toEqualTypeOf<
      {
        id: UUID;
        streamId: UUID;
        streamVersion: bigint;
        name: string;
      }[]
    >();

    expect(result).toEqual([
      {
        id: newUUID,
        streamId: newUUID,
        streamVersion: 1n,
        name: "test",
      },
    ]);
  });
});
