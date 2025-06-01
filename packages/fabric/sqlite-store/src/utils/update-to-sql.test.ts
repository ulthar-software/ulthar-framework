import { Field, Model } from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { updateToSql } from "./update-to-sql.js";

describe("updateToSQL", () => {
  test("Given a model and a query, it should return a SQL string and a record", () => {
    const model = new Model("something", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      age: Field.integer({}),
    });

    const uuid = crypto.randomUUID();

    const record = {
      name: "test",
      age: 20,
    };
    const result = updateToSql(model as unknown as Model, {
      table: "something",
      where: {
        id: uuid,
      },
      set: record,
    });

    expect(result).toEqual([
      `UPDATE \`something\` SET \`name\` = $name, \`age\` = $age WHERE \`something\`.\`id\` = $where_something_id`,
      {
        name: "test",
        age: 20,
        where_something_id: uuid,
      },
    ]);
  });
});
