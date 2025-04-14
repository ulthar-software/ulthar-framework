/* eslint-disable @typescript-eslint/unbound-method */
import { describe, expect, partialMock, test } from "@fabric/testing";
import { Effect } from "../../../../effect/effect.js";
import { Field } from "../../../models/fields.js";
import { Model } from "../../../models/model.js";
import type { Infer } from "../../../models/schema.js";
import { StoreQueryError } from "../../errors/store-query-error.js";
import type { ValueStoreDriver } from "../../value-store-driver.js";
import { StoreInsertQueryBuilder } from "./insert-query-builder.js";

describe("StoreInsertQueryBuilder", () => {
  const Demo = new Model("demo", {
    name: Field.string({}),
  });
  type Demo = Infer<typeof Demo>;

  test("given a value, when `value` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      insert: () => Effect.ok(undefined),
    });

    const query = new StoreInsertQueryBuilder<Demo>(driver, Demo, "demo").value(
      {
        name: "test",
      },
    );

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.insert).toHaveBeenCalledWith(Demo, {
      into: "demo",
      values: [{ name: "test" }],
    });

    expect(result.isOk()).toBe(true);
  });

  test("given multiple values, when `manyValues` is called, it should return an Effect", async () => {
    const driver = partialMock<ValueStoreDriver>({
      insert: () => Effect.ok(undefined),
    });

    const query = new StoreInsertQueryBuilder<Demo>(
      driver,
      Demo,
      "demo",
    ).manyValues([{ name: "test1" }, { name: "test2" }]);

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.insert).toHaveBeenCalledWith(Demo, {
      into: "demo",
      values: [{ name: "test1" }, { name: "test2" }],
    });

    expect(result.isOk()).toBe(true);
  });

  test("given an error, when `value` is called, it should return an Effect with an error", async () => {
    const driver = partialMock<ValueStoreDriver>({
      insert: () => Effect.failWith(new StoreQueryError("Insert failed")),
    });

    const query = new StoreInsertQueryBuilder<Demo>(driver, Demo, "demo").value(
      {
        name: "test",
      },
    );

    expect(query).toBeInstanceOf(Effect);

    const result = await query.run();

    expect(driver.insert).toHaveBeenCalledWith(Demo, {
      into: "demo",
      values: [{ name: "test" }],
    });

    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow().message).toBe("Insert failed");
  });
});
