import { Field, Model } from "@fabric/models";
import { describe, expect, test } from "@fabric/testing";
import { insertToSQL } from "./insert-to-sql.ts";

describe("insertToSQL", () => {
  test("Given a model and a query, it should return a SQL string and a record", () => {
    const model = Model.from("something", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      age: Field.integer({}),
    });

    const record = {
      id: "1",
      name: "test",
      age: 20,
    };
    const result = insertToSQL(model, {
      into: "something",
      values: [record],
    });

    expect(result).toEqual([
      `INSERT INTO something (id, name, age) VALUES ($0_id, $0_name, $0_age)`,
      {
        $0_id: "1",
        $0_name: "test",
        $0_age: 20,
      },
    ]);
  });
});
