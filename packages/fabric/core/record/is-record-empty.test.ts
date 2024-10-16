import { describe, expect, test } from "@fabric/testing";
import { isRecordEmpty } from "./is-record-empty.ts";

describe("Record - Is Record Empty", () => {
  test("Given an empty record, it should return true", () => {
    const result = isRecordEmpty({});
    expect(result).toBe(true);
  });

  test("Given a record with a single key, it should return false", () => {
    const result = isRecordEmpty({ key: "value" });
    expect(result).toBe(false);
  });

  test("Given a record with multiple keys, it should return false", () => {
    const result = isRecordEmpty({ key1: "value1", key2: "value2" });
    expect(result).toBe(false);
  });
});
