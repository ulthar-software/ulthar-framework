import { describe, expect, it } from "vitest";
import { isRecordEmpty } from "./is-record-empty.js";

describe("Record - Is Record Empty", () => {
  it("should return true for an empty record", () => {
    const result = isRecordEmpty({});
    expect(result).toBe(true);
  });

  it("should return false for a non-empty record", () => {
    const result = isRecordEmpty({ key: "value" });
    expect(result).toBe(false);
  });

  it("should return false for a record with multiple keys", () => {
    const result = isRecordEmpty({ key1: "value1", key2: "value2" });
    expect(result).toBe(false);
  });
});
