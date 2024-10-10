import { isError } from "@fabric/core";
import { defineModel, Field, isLike } from "@fabric/domain";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { SQLiteStorageDriver } from "./sqlite-driver.js";

describe("SQLite Store Driver", () => {
  const schema = {
    demo: defineModel("demo", {
      value: Field.float(),
      owner: Field.reference({ targetModel: "users" }),
    }),
    users: defineModel("users", {
      name: Field.string(),
    }),
  };

  let driver: SQLiteStorageDriver;

  beforeEach(() => {
    driver = new SQLiteStorageDriver(":memory:");
  });

  afterEach(async () => {
    const result = await driver.close();
    if (isError(result)) throw result;
  });

  it("should synchronize the store and insert a record", async () => {
    const result = await driver.sync(schema);

    if (isError(result)) throw result;

    const insertResult = await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });

    if (isError(insertResult)) throw insertResult;

    const records = (
      await driver.select(schema, { from: "users" })
    ).unwrapOrThrow();

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
    ]);
  });

  it("should be update a record", async () => {
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });

    const err = await driver.update(schema.users, "1", { name: "updated" });
    if (isError(err)) throw err;

    const records = (
      await driver.select(schema, { from: "users" })
    ).unwrapOrThrow();

    expect(records).toEqual([
      { id: "1", name: "updated", streamId: "1", streamVersion: 1n },
    ]);
  });

  it("should be able to delete a record", async () => {
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });

    await driver.delete(schema.users, "1");

    const records = (
      await driver.select(schema, { from: "users" })
    ).unwrapOrThrow();

    expect(records).toEqual([]);
  });

  it("should be able to select records", async () => {
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await driver.insert(schema.users, {
      id: "2",
      name: "test",
      streamId: "2",
      streamVersion: 1n,
    });

    const records = (
      await driver.select(schema, { from: "users" })
    ).unwrapOrThrow();

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
      { id: "2", name: "test", streamId: "2", streamVersion: 1n },
    ]);
  });

  it("should be able to select one record", async () => {
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await driver.insert(schema.users, {
      id: "2",
      name: "test",
      streamId: "2",
      streamVersion: 1n,
    });

    const record = (
      await driver.selectOne(schema, { from: "users" })
    ).unwrapOrThrow();

    expect(record).toEqual({
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
  });

  it("should select a record with a where clause", async () => {
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await driver.insert(schema.users, {
      id: "2",
      name: "jamón",
      streamId: "2",
      streamVersion: 1n,
    });

    const result = (
      await driver.select(schema, {
        from: "users",
        where: { name: isLike("te%") },
      })
    ).unwrapOrThrow();

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
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await driver.insert(schema.users, {
      id: "2",
      name: "jamón",
      streamId: "2",
      streamVersion: 1n,
    });

    const result = (
      await driver.select(schema, {
        from: "users",
        where: { streamVersion: 1n },
      })
    ).unwrapOrThrow();

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
    await driver.sync(schema);

    await driver.insert(schema.users, {
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
    await driver.insert(schema.users, {
      id: "2",
      name: "jamón",
      streamId: "2",
      streamVersion: 1n,
    });

    const result = (
      await driver.select(schema, {
        from: "users",
        limit: 1,
        offset: 1,
      })
    ).unwrapOrThrow();

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
