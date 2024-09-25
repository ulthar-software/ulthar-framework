import { createModel, Field, isError } from "@fabric/core";
import { afterEach, beforeEach, describe, expect, test } from "vitest";
import { SQLiteStorageDriver } from "./sqlite-driver.js";

describe("SQLite Store Driver", () => {
  const model = createModel({
    name: "test",
    fields: {
      id: Field.uuid({}),
      name: Field.string(),
    },
  });

  let store: SQLiteStorageDriver;

  beforeEach(() => {
    store = new SQLiteStorageDriver(":memory:");
  });

  afterEach(async () => {
    const result = await store.close();
    if (isError(result)) throw result;
  });

  test("should be able to synchronize the store and insert a record", async () => {
    const result = await store.sync([model]);

    if (isError(result)) throw result;

    await store.insert("test", { id: "1", name: "test" });

    const records = await store.select({ from: "test" });

    expect(records).toEqual([{ id: "1", name: "test" }]);
  });

  test("should be able to update a record", async () => {
    const result = await store.sync([model]);

    if (isError(result)) throw result;

    await store.insert("test", { id: "1", name: "test" });

    await store.update("test", "1", { name: "updated" });

    const records = await store.select({ from: "test" });

    expect(records).toEqual([{ id: "1", name: "updated" }]);
  });

  test("should be able to delete a record", async () => {
    const result = await store.sync([model]);

    if (isError(result)) throw result;

    await store.insert("test", { id: "1", name: "test" });

    await store.delete("test", "1");

    const records = await store.select({ from: "test" });

    expect(records).toEqual([]);
  });

  test("should be able to select records", async () => {
    const result = await store.sync([model]);

    if (isError(result)) throw result;

    await store.insert("test", { id: "1", name: "test" });
    await store.insert("test", { id: "2", name: "test" });

    const records = await store.select({ from: "test" });

    expect(records).toEqual([
      { id: "1", name: "test" },
      { id: "2", name: "test" },
    ]);
  });

  test("should be able to select one record", async () => {
    const result = await store.sync([model]);

    if (isError(result)) throw result;

    await store.insert("test", { id: "1", name: "test" });
    await store.insert("test", { id: "2", name: "test" });

    const record = await store.selectOne({ from: "test" });

    expect(record).toEqual({ id: "1", name: "test" });
  });
});
