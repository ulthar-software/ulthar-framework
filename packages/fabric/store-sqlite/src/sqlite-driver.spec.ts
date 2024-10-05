import { isError } from "@fabric/core";
import { defineModel, Field } from "@fabric/domain";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { SQLiteStorageDriver } from "./sqlite-driver.js";

describe("SQLite Store Driver", () => {
  const schema = {
    users: defineModel("users", {
      name: Field.string(),
    }),
  };

  let store: SQLiteStorageDriver;

  beforeEach(() => {
    store = new SQLiteStorageDriver(":memory:");
  });

  afterEach(async () => {
    const result = await store.close();
    if (isError(result)) throw result;
  });

  test("should be able to synchronize the store and insert a record", async () => {
    const result = await store.sync(schema);

    if (isError(result)) throw result;

    const insertResult = await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });

    if (isError(insertResult)) throw insertResult;

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
    ]);
  });

  test("should be able to update a record", async () => {
    const result = await store.sync(schema);

    if (isError(result)) throw result;

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1,
    });

    await store.update(schema.users, "1", { name: "updated" });

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([
      { id: "1", name: "updated", streamId: "1", streamVersion: 1n },
    ]);
  });

  test("should be able to delete a record", async () => {
    const result = await store.sync(schema);

    if (isError(result)) throw result;

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1,
    });

    await store.delete(schema.users, "1");

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([]);
  });

  test("should be able to select records", async () => {
    const result = await store.sync(schema);

    if (isError(result)) throw result;

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "test",
      streamId: "2",
      streamVersion: 1,
    });

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
      { id: "2", name: "test", streamId: "2", streamVersion: 1n },
    ]);
  });

  test("should be able to select one record", async () => {
    const result = await store.sync(schema);

    if (isError(result)) throw result;

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "test",
      streamId: "2",
      streamVersion: 1,
    });

    const record = await store.selectOne(schema.users, { from: "users" });

    expect(record).toEqual({
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
  });
});
