import { Field, Model } from "@fabric/models";
import { describe, expect, test } from "@fabric/testing";
import {
  manyRecordsToSQLParamRecord,
  recordToSQLParamKeys,
  recordToSQLParamRecord,
} from "./record-utils.ts";

describe("recordToSQLParamKeys", () => {
  test(
    "Given a record, it should return a string of it's keys separated by commas",
    () => {
      // arrange
      const record = {
        id: "1",
        name: "test",
        age: 20,
      };
      // act
      const result = recordToSQLParamKeys(record);
      // assert
      expect(result).toEqual("$id, $name, $age");
    },
  );

  test(
    "Given a record and a prefix, it should return a string of it's keys separated by commas",
    () => {
      // arrange
      const record = {
        id: "1",
        name: "test",
        age: 20,
      };
      // act
      const result = recordToSQLParamKeys(record, "prefix_");
      // assert
      expect(result).toEqual("$prefix_id, $prefix_name, $prefix_age");
    },
  );
});

describe("recordToSQLParamRecord", () => {
  test("should unfold a record into a string of it's keys separated by commas", () => {
    // arrange
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

    // act
    const result = recordToSQLParamRecord(model, record);

    // assert
    expect(result).toEqual({ $id: "1", $name: "test", $age: 20 });
  });
});

describe("manyRecordsToSQLParamRecord", () => {
  test("should unfold a record into a string of it's keys separated by commas", () => {
    // arrange
    const model = Model.from("something", {
      id: Field.uuid({ isPrimaryKey: true }),
      name: Field.string({}),
      age: Field.integer({}),
    });

    const records = [
      {
        id: "1",
        name: "test",
        age: 20,
      },
      {
        id: "2",
        name: "test2",
        age: 21,
      },
    ];

    // act
    const result = manyRecordsToSQLParamRecord(model, records);

    // assert
    expect(result).toEqual({
      $0_id: "1",
      $0_name: "test",
      $0_age: 20,
      $1_id: "2",
      $1_name: "test2",
      $1_age: 21,
    });
  });
});
