import { Run } from "@fabric/core";
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
    await Run.UNSAFE(() => driver.close());
  });

  it("should synchronize the store and insert a record", async () => {
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );

    const records = await Run.UNSAFE(() =>
      driver.select(schema, { from: "users" }),
    );

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
    ]);
  });

  it("should be update a record", async () => {
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );

    await Run.UNSAFE(() =>
      driver.update(schema.users, "1", { name: "updated" }),
    );

    const records = await Run.UNSAFE(() =>
      driver.select(schema, { from: "users" }),
    );

    expect(records).toEqual([
      { id: "1", name: "updated", streamId: "1", streamVersion: 1n },
    ]);
  });

  it("should be able to delete a record", async () => {
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );

    await Run.UNSAFE(() => driver.delete(schema.users, "1"));

    const records = await Run.UNSAFE(() =>
      driver.select(schema, { from: "users" }),
    );

    expect(records).toEqual([]);
  });

  it("should be able to select records", async () => {
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );
    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "2",
        name: "test",
        streamId: "2",
        streamVersion: 1n,
      }),
    );

    const records = await Run.UNSAFE(() =>
      driver.select(schema, { from: "users" }),
    );

    expect(records).toEqual([
      { id: "1", name: "test", streamId: "1", streamVersion: 1n },
      { id: "2", name: "test", streamId: "2", streamVersion: 1n },
    ]);
  });

  it("should be able to select one record", async () => {
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );
    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "2",
        name: "test",
        streamId: "2",
        streamVersion: 1n,
      }),
    );

    const record = await Run.UNSAFE(() =>
      driver.selectOne(schema, { from: "users" }),
    );

    expect(record).toEqual({
      id: "1",
      name: "test",
      streamId: "1",
      streamVersion: 1n,
    });
  });

  it("should select a record with a where clause", async () => {
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );
    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "2",
        name: "jamón",
        streamId: "2",
        streamVersion: 1n,
      }),
    );

    const result = await Run.UNSAFE(() =>
      driver.select(schema, {
        from: "users",
        where: { name: isLike("te%") },
      }),
    );

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
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );
    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "2",
        name: "jamón",
        streamId: "2",
        streamVersion: 1n,
      }),
    );

    const result = await Run.UNSAFE(() =>
      driver.select(schema, {
        from: "users",
        where: { streamVersion: 1n },
      }),
    );

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
    await Run.UNSAFE(() => driver.sync(schema));

    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "1",
        name: "test",
        streamId: "1",
        streamVersion: 1n,
      }),
    );
    await Run.UNSAFE(() =>
      driver.insert(schema.users, {
        id: "2",
        name: "jamón",
        streamId: "2",
        streamVersion: 1n,
      }),
    );

    const result = await Run.UNSAFE(() =>
      driver.select(schema, {
        from: "users",
        limit: 1,
        offset: 1,
      }),
    );

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
