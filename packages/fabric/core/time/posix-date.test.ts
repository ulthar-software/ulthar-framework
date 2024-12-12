import { describe, expect, test } from "@fabric/testing";
import { PosixDate } from "./posix-date.ts";

describe("PosixDate", () => {
  test("constructor should create a PosixDate with the current timestamp", () => {
    const date = new PosixDate();
    expect(date.timestamp).toBeLessThanOrEqual(Date.now());
  });

  test("constructor should create a PosixDate with the provided timestamp", () => {
    const timestamp = 1627849200000;
    const date = new PosixDate(timestamp);
    expect(date.timestamp).toBe(timestamp);
  });
});
