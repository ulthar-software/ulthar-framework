import { Effect } from "@fabric/core";
import { describe, expect, partialMock, test } from "@fabric/testing";
import { StoreQueryError } from "../../errors/store-query-error.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { StoreInsertQueryBuilder } from "./insert-query-builder.ts";

describe("InsertQueryBuilder", () => {
  type DemoType = {
    name: string;
  };

  test(
    "given a value, when `value` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        insert: () => Effect.ok(undefined),
      });

      const query = new StoreInsertQueryBuilder<DemoType>(driver, "demo").value(
        {
          name: "test",
        },
      );

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.insert).toHaveBeenCalledWith({
        into: "demo",
        values: [{ name: "test" }],
      });

      expect(result.isOk()).toBe(true);
    },
  );

  test(
    "given multiple values, when `manyValues` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        insert: () => Effect.ok(undefined),
      });

      const query = new StoreInsertQueryBuilder<DemoType>(driver, "demo")
        .manyValues([
          { name: "test1" },
          { name: "test2" },
        ]);

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.insert).toHaveBeenCalledWith({
        into: "demo",
        values: [{ name: "test1" }, { name: "test2" }],
      });

      expect(result.isOk()).toBe(true);
    },
  );

  test(
    "given an error, when `value` is called, it should return an Effect with an error",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        insert: () => Effect.failWith(new StoreQueryError("Insert failed")),
      });

      const query = new StoreInsertQueryBuilder<DemoType>(driver, "demo").value(
        {
          name: "test",
        },
      );

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.insert).toHaveBeenCalledWith({
        into: "demo",
        values: [{ name: "test" }],
      });

      expect(result.isError()).toBe(true);
      expect(result.unwrapErrorOrThrow().message).toBe("Insert failed");
    },
  );
});
