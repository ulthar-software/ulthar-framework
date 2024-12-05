import { Effect, Option } from "@fabric/core";
import { describe, expect, partialMock, test } from "@fabric/testing";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { StoreReadQueryBuilder } from "./read-query-builder.ts";

describe("QueryBuilder", () => {
  type DemoType = {
    name: string;
  };

  test(
    "given a query, when `select` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        getMany: () => Effect.ok([]),
      });

      const query = new StoreReadQueryBuilder<DemoType>(driver, {
        from: "demo",
      }).where({
        name: "test",
      }).select();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.getMany).toHaveBeenCalledWith({
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
        getOne: () => Effect.ok(Option.none()),
      });

      const query = new StoreReadQueryBuilder<DemoType>(driver, {
        from: "demo",
      }).where({
        name: "test",
      }).selectOne();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.getOne).toHaveBeenCalledWith({
        from: "demo",
        where: { name: "test" },
      });

      expect(result.unwrapOrThrow().value).toBeNull();
    },
  );
});
