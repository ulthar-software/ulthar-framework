/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, partialMock, test } from "@fabric/testing";
import { Effect } from "../../../../effect/effect.js";
import { Field } from "../../../models/fields.js";
import { Model, type Infer } from "../../../models/index.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import { StoreReadQueryBuilder } from "./read-query-builder.js";

describe("StoreReadQueryBuilder", () => {
  const Demo = new Model("demo", {
    name: Field.string({}),
    age: Field.integer({}),
  });
  type Demo = Infer<typeof Demo>;

  const User = new Model("user", {
    id: Field.string({}),
    username: Field.string({}),
    role: Field.string({}),
  });
  type User = Infer<typeof User>;

  test("given a query, when `select` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("given a query, when `selectOne` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .selectOne();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      limit: 1,
    });

    expect(result.unwrapOrThrow().value).toBeNull();
  });

  test("given a query that returns empty, when `selectOneOrFail` is called it should return an Error", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .selectOneOrFail();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      limit: 1,
    });

    expect(result.isError()).toBe(true);
  });
  test("given a query that returns values, when `selectOneOrFail` is called, it should return an Ok result", async () => {
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
    })
      .where({
        name: "test",
      })
      .selectOneOrFail();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      limit: 1,
    });

    expect(result.isError()).toBe(false);
  });

  test("given a query that returns empty, when `assertNone` is called, it should return an Ok result", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .assertNone();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      limit: 1,
    });

    expect(result.isError()).toBe(false);
  });

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
    })
      .where({
        name: "test",
      })
      .assertNone();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      limit: 1,
    });

    expect(result.isError()).toBe(true);
  });

  test("given a query, when `select` is called with keys, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .select(["name"]);

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      keys: ["name"],
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("given a query with order by, when `select` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .orderBy({
        name: "ASC",
      })
      .select();

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
    })
      .limit(10)
      .select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      limit: 10,
      offset: 0,
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query with leftJoin, when `select` is called, it should return an Effect with the join configuration", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .leftJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "left",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
      ],
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query with multiple leftJoins, it should correctly accumulate all join configurations", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const Role = new Model("role", {
      id: Field.string({}),
      name: Field.string({}),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .leftJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .leftJoin({
        model: Role,
        as: "role",
        on: {
          left: "user.role",
          right: "id",
        },
      })
      .select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "left",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
        {
          type: "left",
          model: Role,
          as: "role",
          on: {
            left: "user.role",
            right: "id",
          },
        },
      ],
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query with leftJoin, when `selectAndMap` is called, it should map values from the joined model", async () => {
    const mockData = [
      {
        name: "John",
        age: 30,
        "user.id": "user-1",
        "user.username": "john_doe",
        "user.role": "admin",
      },
    ];

    const driver = partialMock<ValueStoreDriver>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: () => Effect.ok(mockData as any),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .leftJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .selectAndMap((results) => {
        return results.map((item) => ({
          name: item.name,
          age: item.age,
          user: {
            id: item["user.id"],
            username: item["user.username"],
            role: item["user.role"],
          },
        }));
      });

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "left",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
      ],
    });

    expect(result.unwrapOrThrow()).toEqual([
      {
        name: "John",
        age: 30,
        user: {
          id: "user-1",
          username: "john_doe",
          role: "admin",
        },
      },
    ]);
  });

  test("Given a query with multiple joined models, when `selectAndMap` is called, it should map values from all joined models", async () => {
    const Role = new Model("role", {
      id: Field.string({}),
      name: Field.string({}),
      permissions: Field.string({}),
    });

    const mockData = [
      {
        name: "John",
        age: 30,
        "user.id": "user-1",
        "user.username": "john_doe",
        "user.role": "admin",
        "role.id": "role-1",
        "role.name": "Administrator",
        "role.permissions": "all",
      },
    ];

    const driver = partialMock<ValueStoreDriver>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: () => Effect.ok(mockData as any),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .leftJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .leftJoin({
        model: Role,
        as: "role",
        on: {
          left: "user.role",
          right: "id",
        },
      })
      .selectAndMap((results) => {
        return results.map((item) => ({
          name: item.name,
          age: item.age,
          user: {
            id: item["user.id"],
            username: item["user.username"],
          },
          role: {
            id: item["role.id"],
            name: item["role.name"],
            permissions: item["role.permissions"],
          },
        }));
      });

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "left",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
        {
          type: "left",
          model: Role,
          as: "role",
          on: {
            left: "user.role",
            right: "id",
          },
        },
      ],
    });

    expect(result.unwrapOrThrow()).toEqual([
      {
        name: "John",
        age: 30,
        user: {
          id: "user-1",
          username: "john_doe",
        },
        role: {
          id: "role-1",
          name: "Administrator",
          permissions: "all",
        },
      },
    ]);
  });

  test("Given a query with a join, when `selectAndMap` is called with specific keys, it should map only those fields", async () => {
    const mockData = [
      {
        name: "John",
        "user.username": "john_doe",
      },
    ];

    const driver = partialMock<ValueStoreDriver>({
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      get: () => Effect.ok(mockData as any),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .leftJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .selectAndMap(
        (results) => {
          return results.map((item) => ({
            name: item.name,
            username: item["user.username"],
          }));
        },
        ["name", "user.username"],
      );

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "left",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
      ],
      keys: ["name", "user.username"],
    });

    expect(result.unwrapOrThrow()).toEqual([
      {
        name: "John",
        username: "john_doe",
      },
    ]);
  });

  test("Given a query, when `selectDistinct` is called, it should return an Effect with distinct set to true", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .selectDistinct();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      distinct: true,
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query, when `selectDistinct` is called with keys, it should return an Effect with those keys and distinct set to true", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .where({
        name: "test",
      })
      .selectDistinct(["name"]);

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      where: { name: "test" },
      keys: ["name"],
      distinct: true,
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query with innerJoin, when `select` is called, it should return an Effect with inner join configuration", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .innerJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "inner",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
      ],
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });

  test("Given a query with multiple joins including innerJoin, it should correctly accumulate all join configurations", async () => {
    const driver = partialMock<ValueStoreDriver>({
      get: () => Effect.ok([]),
    });

    const Role = new Model("role", {
      id: Field.string({}),
      name: Field.string({}),
    });

    const query = new StoreReadQueryBuilder<Demo>(driver, Demo, {
      from: "demo",
    })
      .leftJoin({
        model: User,
        as: "user",
        on: {
          left: "name",
          right: "username",
        },
      })
      .innerJoin({
        model: Role,
        as: "role",
        on: {
          left: "user.role",
          right: "id",
        },
      })
      .select();

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.get).toHaveBeenCalledWith(Demo, {
      from: "demo",
      joins: [
        {
          type: "left",
          model: User,
          as: "user",
          on: {
            left: "name",
            right: "username",
          },
        },
        {
          type: "inner",
          model: Role,
          as: "role",
          on: {
            left: "user.role",
            right: "id",
          },
        },
      ],
    });

    expect(result.unwrapOrThrow()).toEqual([]);
  });
});
