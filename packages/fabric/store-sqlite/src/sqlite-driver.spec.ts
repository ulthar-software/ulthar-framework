import { isError } from "@fabric/core";
import { defineModel, Field, isLike } from "@fabric/domain";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
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

  it("should synchronize the store and insert a record", async () => {
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

  it("should be update a record", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });

    const err = await store.update(schema.users, "1", { name: "updated" });
    if (isError(err)) throw err;

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([
      { id: "1", name: "updated", streamId: "1", streamVersion: 1n },
    ]);
  });

  it("should be able to delete a record", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });

    await store.delete(schema.users, "1");

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([]);
  });

  it("should be able to select records", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "test",
      streamId: "2",
      streamVersion: 1n,
    });

    const records = await store.select(schema.users, { from: "users" });

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
      { id: "2", name: "test", streamId: "2", streamVersion: 1n },
    ]);
  });

  it("should be able to select one record", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "test",
      streamId: "2",
      streamVersion: 1n,
    });

    const record = await store.selectOne(schema.users, { from: "users" });

    expect(record).toEqual({
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
  });

  it("should select a record with a where clause", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "jamón",
      streamId: "2",
      streamVersion: 1n,
    });

    const result = await store.select(schema.users, {
      from: "users",
      where: { name: isLike("te%") },
    });

    expect(result).toEqual([
      {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      },
    ]);
  });

  it("should select a record with a where clause of a specific type", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "jamón",
      streamId: "2",
      streamVersion: 1n,
    });

    const result = await store.select(schema.users, {
      from: "users",
      where: { streamVersion: 1n },
    });

    expect(result).toEqual([
      {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      },
      {
        id: "2",
        name: "jamón",
        streamId: "2",
        streamVersion: 1n,
      },
    ]);
  });

  it("should select with a limit and offset", async () => {
    await store.sync(schema);

    await store.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await store.insert(schema.users, {
      id: "2",
      name: "jamón",
      streamId: "2",
      streamVersion: 1n,
    });

    const result = await store.select(schema.users, {
      from: "users",
      limit: 1,
      offset: 1,
    });

    expect(result).toEqual([
      {
        id: "2",
        name: "jamón",
        streamId: "2",
        streamVersion: 1n,
      },
    ]);
  });
});
