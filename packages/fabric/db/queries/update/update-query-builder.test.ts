import { Effect } from "@fabric/core";
import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { describe, expect, partialMock, test } from "@fabric/testing";
import { Field, Model, ModelToType } from "../../../models/index.ts";
import { ValueStoreDriver } from "../../value-store-driver.ts";
import { StoreUpdateQueryBuilder } from "./update-query-builder.ts";

describe("StoreUpdateQueryBuilder", () => {
  const Demo = Model.from("demo", {
    name: Field.string({}),
  });
  type Demo = ModelToType<typeof Demo>;

  test(
    "given an ID, when `oneById` is called, it should return a SettableUpdateQuery",
    async () => {
      const driver = partialMock<ValueStoreDriver>({
        update: () => Effect.ok(),
      });

      const uuid = UUIDGeneratorMock.generate();

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
    },
  );

  test(
    "given a filter, when `where` is called, it should return a SettableUpdateQuery",
    async () => {
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
    },
  );

  test(
    "given a value, when `set` is called, it should return an Effect",
    async () => {
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
    },
  );
});
