import { describe, expect, test } from "@fabric/testing";
import { parseAndSanitizeString } from "./sanitize-string.ts";

describe("Sanitize String", () => {
  test("Given a string with low characters it should sanitize it", () => {
    const sanitized = parseAndSanitizeString("John\x00");

    expect(sanitized).toBe("John");
  });

  test("Given a string with leading and trailing spaces it should trim them", () => {
    const sanitized = parseAndSanitizeString(" John ");

    expect(sanitized).toBe("John");
  });

  test("Given a number value it should convert it to a string", () => {
    const sanitized = parseAndSanitizeString(123);

    expect(sanitized).toBe("123");
  });

  test("Given a boolean value it should convert it to a string", () => {
    const sanitized = parseAndSanitizeString(true);

    expect(sanitized).toBe("true");
  });

  test("Given a null value it should convert it to an empty string", () => {
    const sanitized = parseAndSanitizeString(null);

    expect(sanitized).toBe("null");
  });

  test("Given an undefined value it should convert it to an empty string", () => {
    const sanitized = parseAndSanitizeString(undefined);

    expect(sanitized).toBe(undefined);
  });
});
