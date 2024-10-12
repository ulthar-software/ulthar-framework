import { defineCollection, Field } from "@fabric/domain";
import { describe, expect, it } from "vitest";
import { modelToSql } from "./model-to-sql.js";

describe("ModelToSQL", () => {
  const model = defineCollection("something", {
    id: Field.uuid({ isPrimaryKey: true }),
    name: Field.string(),
    age: Field.integer(),
    // isTrue: Field.boolean(),
    date: Field.timestamp(),
    reference: Field.reference({ targetModel: "somethingElse" }),
  });

  it("should generate SQL for a model", () => {
    const result = modelToSql(model);

    expect(result).toEqual(
      `CREATE TABLE something (id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL, date NUMERIC NOT NULL, reference TEXT NOT NULL REFERENCES somethingElse(id))`,
    );
  });
});
