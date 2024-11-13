import {
  AlreadyExistsError,
  Field,
  isLike,
  Model,
  NotFoundError,
} from "@fabric/domain";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { afterEach, beforeEach, describe, expect, test } from "@fabric/testing";
import { SQLiteStateStore } from "./state-store.ts";

describe("QueryBuilder", () => {
  const models = [
    Model.entityFrom("test", {
      name: Field.string(),
    }),
  ];

  let stateStore = new SQLiteStateStore(":memory:", models);

  beforeEach(async () => {
    stateStore = new SQLiteStateStore(":memory:", models);
    await stateStore.migrate().runOrThrow();
    await stateStore.insertInto("test", {
      id: UUIDGeneratorMock.generate(),
      name: "test1",
    }).runOrThrow();
    await stateStore.insertInto("test", {
      id: UUIDGeneratorMock.generate(),
      name: "test2",
    }).runOrThrow();
  });

  afterEach(async () => {
    await stateStore.close().runOrThrow();
  });

  test("select() after a where() should return valid results", async () => {
    const result = await stateStore.from("test").where({
      name: isLike("test%"),
    })
      .select().runOrThrow();
    expect(result).toEqual([{
      id: expect.any(String),
      name: "test1",
    }, {
      id: expect.any(String),
      name: "test2",
    }]);
  });

  test("selectOneOrFail() should return a single result", async () => {
    const result = await stateStore.from("test").where({ name: "test1" })
      .selectOneOrFail().runOrThrow();
    expect(result).toEqual({
      id: expect.any(String),
      name: "test1",
    });
  });

  test("selectOneOrFail() should fail if no results are found", async () => {
    const error = await stateStore.from("test").where({ name: "not-found" })
      .selectOneOrFail().failOrThrow();

    expect(error).toBeInstanceOf(NotFoundError);
  });

  test("selectOne() should return a single result", async () => {
    const result = await stateStore.from("test")
      .selectOne().runOrThrow();

    expect(result).toEqual({
      id: expect.any(String),
      name: "test1",
    });
  });

  test("selectOne() should return undefined if no results are found", async () => {
    const result = await stateStore.from("test").where({
      name: "not-found",
    })
      .selectOne().runOrThrow();

    expect(result).toBeUndefined();
  });

  test("assertNone() should succeed if no results are found", async () => {
    const result = await stateStore.from("test").where({
      name: "not-found",
    }).assertNone().runOrThrow();

    expect(result).toBeUndefined();
  });

  test("assertNone() should fail if results are found", async () => {
    const error = await stateStore.from("test").where({ name: "test1" })
      .assertNone().failOrThrow();

    expect(error).toBeInstanceOf(AlreadyExistsError);
  });
});
