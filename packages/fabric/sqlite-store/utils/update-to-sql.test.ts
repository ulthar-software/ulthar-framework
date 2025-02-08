import { UUIDGeneratorMock } from "@fabric/domain/mocks";
import { Field, Model } from "@fabric/models";
import { describe, expect, test } from "@fabric/testing";
import { updateToSQL } from "./update-to-sql.ts";

describe("updateToSQL", () => {
  test("Given a model and a query, it should return a SQL string and a record", () => {
    const model = new Model("something", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      age: Field.integer({}),
    });

    const uuid = UUIDGeneratorMock.generate();

    const record = {
      name: "test",
      age: 20,
    };
    const result = updateToSQL(model, {
      table: "something",
      where: {
        id: uuid,
      },
      set: record,
    });

    expect(result).toEqual([
      `UPDATE something SET name = $name, age = $age WHERE id = $where_id`,
      {
        $name: "test",
        $age: 20,
        $where_id: uuid,
      },
    ]);
  });
});
