import { Effect } from "@fabric/core";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { describe, expect, partialMock, test } from "@fabric/testing";
import { Field, Model, ModelToType } from "../../../models/index.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { StoreDeleteQueryBuilder } from "./delete-query-builder.ts";

describe("StoreDeleteQueryBuilder", () => {
  const Demo = Model.from("demo", {
    name: Field.string({}),
  });
  type Demo = ModelToType<typeof Demo>;

  test(
    "given a query, when `manyWhere` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        delete: () => Effect.ok(),
      });

      const query = new StoreDeleteQueryBuilder<Demo>(driver, Demo, "demo")
        .manyWhere({ name: "test" });

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.delete).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { name: "test" },
      });

      expect(result.isOk()).toBe(true);
    },
  );

  test(
    "given a query, when `oneById` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        delete: () => Effect.ok(),
      });

      const uuid = UUIDGeneratorMock.generate();

      const query = new StoreDeleteQueryBuilder<Demo>(driver, Demo, "demo")
        .oneById(uuid);

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.delete).toHaveBeenCalledWith(Demo, {
        from: "demo",
        where: { id: uuid },
      });

      expect(result.isOk()).toBe(true);
    },
  );

  test(
    "given a query, when `all` is called, it should return an Effect",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        delete: () => Effect.ok(),
      });

      const query = new StoreDeleteQueryBuilder<Demo>(driver, Demo, "demo")
        .all();

      expect(query).toBeInstanceOf(Effect);

      const result = await query.run();

      expect(driver.delete).toHaveBeenCalledWith(Demo, {
        from: "demo",
      });

      expect(result.isOk()).toBe(true);
    },
  );
});
