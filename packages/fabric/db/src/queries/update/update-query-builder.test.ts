/* eslint-disable @typescript-eslint/unbound-method */
import { Effect } from "@fabric/core";
import { Field, Model, type ModelToType } from "@fabric/models";
import { describe, expect, partialMock, test } from "@fabric/testing";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import { StoreUpdateQueryBuilder } from "./update-query-builder.js";

describe("StoreUpdateQueryBuilder", () => {
  const Demo = new Model("demo", {
    name: Field.string({}),
  });
  type Demo = ModelToType<typeof Demo>;

  test("given an ID, when `oneById` is called, it should return a SettableUpdateQuery", async () => {
    const driver = partialMock<ValueStoreDriver>({
      update: () => Effect.ok(),
    });

    const uuid = crypto.randomUUID();

    const query = new StoreUpdateQueryBuilder<Demo>(driver, Demo, {
      table: "demo",
    }).oneById(uuid);

    expect(query).toBeInstanceOf(StoreUpdateQueryBuilder);

    const result = await query.set({ name: "updated" }).run();

    expect(driver.update).toHaveBeenCalledWith(Demo, {
      table: "demo",
      where: { id: uuid },
      set: { name: "updated" },
    });

    expect(result.isOk()).toBe(true);
  });

  test("given a filter, when `where` is called, it should return a SettableUpdateQuery", async () => {
    const driver = partialMock<ValueStoreDriver>({
      update: () => Effect.ok(),
    });

    const query = new StoreUpdateQueryBuilder<Demo>(driver, Demo, {
      table: "demo",
    }).where({ name: "test" });

    expect(query).toBeInstanceOf(StoreUpdateQueryBuilder);

    const result = await query.set({ name: "updated" }).run();

    expect(driver.update).toHaveBeenCalledWith(Demo, {
      table: "demo",
      where: { name: "test" },
      set: { name: "updated" },
    });

    expect(result.isOk()).toBe(true);
  });

  test("given a value, when `set` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      update: () => Effect.ok(),
    });

    const query = new StoreUpdateQueryBuilder<Demo>(driver, Demo, {
      table: "demo",
    }).set({ name: "updated" });

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.update).toHaveBeenCalledWith(Demo, {
      table: "demo",
      set: { name: "updated" },
    });

    expect(result.isOk()).toBe(true);
  });
});
