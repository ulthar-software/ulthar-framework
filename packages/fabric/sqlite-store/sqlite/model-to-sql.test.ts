import { Field, Model } from "@fabric/domain";
import { describe, expect, test } from "@fabric/testing";
import { modelToSql } from "./model-to-sql.ts";

describe("ModelToSQL", () => {
  const model = Model.from("something", {
    id: Field.uuid({ isPrimaryKey: true }),
    name: Field.string(),
    age: Field.integer(),
    // isTrue: Field.boolean(),
    date: Field.posixDate(),
    reference: Field.reference({ targetModel: "somethingElse" }),
  });

  test("should generate SQL for a model", () => {
    const result = modelToSql(model);

    expect(result).toEqual(
      `CREATE TABLE something (id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL, date NUMERIC NOT NULL, reference TEXT NOT NULL REFERENCES somethingElse(id))`,
    );
  });
});
