import { Field, Model } from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { modelToSql } from "./model-to-sql.js";

describe("ModelToSQL", () => {
  test("should generate SQL for a model", () => {
    const model = new Model("something", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      age: Field.integer({}),
      // isTrue: Field.boolean(),
      date: Field.posixDate({}),
      reference: Field.reference({ targetModel: "somethingElse" }),
    });
    const result = modelToSql(model);

    expect(result).toEqual(
      `CREATE TABLE something (id TEXT PRIMARY KEY, name TEXT NOT NULL, age INTEGER NOT NULL, date NUMERIC NOT NULL, reference TEXT NOT NULL REFERENCES somethingElse(id))`,
    );
  });

  test("given custom constraints it should generate SQL for a model", () => {
    const modelWithConstraints = new Model(
      "events",
      {
        _tag: Field.string(),
        streamId: Field.uuid(),
        id: Field.uuid({ isPrimaryKey: true }),
        version: Field.integer({ hasArbitraryPrecision: true }),
        payload: Field.embedded(),
        timestamp: Field.posixDate(),
      },
      {
        constraints: [{ type: "unique", fields: ["streamId", "version"] }],
      },
    );

    const result = modelToSql(modelWithConstraints);

    expect(result).toEqual(
      `CREATE TABLE events (_tag TEXT NOT NULL, streamId TEXT NOT NULL, id TEXT PRIMARY KEY, version INTEGER NOT NULL, payload TEXT NOT NULL, timestamp NUMERIC NOT NULL, UNIQUE(streamId, version))`,
    );
  });
});
