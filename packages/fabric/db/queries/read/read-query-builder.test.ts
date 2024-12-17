import { Effect } from "@fabric/core";
import { Field, Model, ModelToType } from "@fabric/models";
import { describe, expect, partialMock, test } from "@fabric/testing";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { StoreReadQueryBuilder } from "./read-query-builder.ts";

describe("StoreReadQueryBuilder", () => {
  const Demo = new Model("demo", {
    name: Field.string({}),
    age: Field.integer({}),
  });
  type Demo = ModelToType<typeof Demo>;

  test(
    "given a query, when `select` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        get: () => Effect.ok([]),
      });

      const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
        from: "demo",
      }).where({
        name: "test",
      }).select();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.get).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
      });

      expect(result.unwrapOrThrow()).toEqual([]);
    },
  );

  test(
    "given a query, when `selectOne` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        get: () => Effect.ok([]),
      });

      const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
        from: "demo",
      }).where({
        name: "test",
      }).selectOne();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.get).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
        limit: 1,
      });

      expect(result.unwrapOrThrow().value).toBeNull();
    },
  );

  test(
    "given a query that returns empty, when `selectOneOrFail` is called it should return an Error",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        get: () => Effect.ok([]),
      });

      const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
        from: "demo",
      }).where({
        name: "test",
      }).selectOneOrFail();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.get).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
        limit: 1,
      });

      expect(result.isError()).toBe(true);
    },
  );
  test(
    "given a query that returns values, when `selectOneOrFail` is called, it should return an Ok result",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        get: <Demo>() =>
          Effect.ok([
            {
              name: "test",
            } as Demo,
          ]),
      });

      const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
        from: "demo",
      }).where({
        name: "test",
      }).selectOneOrFail();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.get).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
        limit: 1,
      });

      expect(result.isError()).toBe(false);
    },
  );

  test(
    "given a query that returns empty, when `assertNone` is called, it should return an Ok result",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        get: () => Effect.ok([]),
      });

      const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
        from: "demo",
      }).where({
        name: "test",
      }).assertNone();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.get).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
        limit: 1,
      });

      expect(result.isError()).toBe(false);
    },
  );

  test("given a query that returns values, when `assertNone` is called, it should return an Error", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: <Demo>() =>
        Effect.ok([
          {
            name: "test",
          } as Demo,
        ]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    }).where({
      name: "test",
    }).assertNone();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      limit: 1,
    });

    expect(result.isError()).toBe(true);
  });

  test(
    "given a query, when `select` is called with keys, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        get: () => Effect.ok([]),
      });

      const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
        from: "demo",
      }).where({
        name: "test",
      }).select(["name"]);

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.get).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
        keys: ["name"],
      });

      expect(result.unwrapOrThrow()).toEqual([]);
    },
  );

  test("given a query with order by, when `select` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    }).orderBy({
      name: "ASC",
    }).select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      orderBy: {
        name: "ASC",
      },
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query with limit, when `select` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    }).limit(10).select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      limit: 10,
      offset: 0,
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });
});
