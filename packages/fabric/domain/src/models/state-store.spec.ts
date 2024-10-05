import { isError } from "@fabric/core";
import { SQLiteStorageDriver } from "@fabric/store-sqlite";
import { describe, it } from "vitest";
import { generateUUID } from "../types/uuid.js";
import { Field } from "./fields/index.js";
import { defineModel } from "./model.js";
import { StateStore } from "./state-store.js";

describe("State Store", () => {
  const driver = new SQLiteStorageDriver(":memory:");

  const models = [
    defineModel("users", {
      name: Field.string(),
    }),
  ];

  it("should be able to create a new state store and migrate", async () => {
    const store = new StateStore(driver, models);

    const migrationResult = await store.migrate();

    if (isError(migrationResult)) throw migrationResult;
  });

  it("should be able to insert a record", async () => {
    const store = new StateStore(driver, models);

    const migrationResult = await store.migrate();

    if (isError(migrationResult)) throw migrationResult;

    const newUUID = generateUUID();

    const insertResult = await store.insertInto("users", {
      name: "test",
      id: newUUID,
      streamId: newUUID,
      streamVersion: 1n,
    });

    if (isError(insertResult)) throw insertResult;
  });
});
