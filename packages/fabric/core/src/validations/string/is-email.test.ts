import { describe, expect, test } from "@fabric/testing";
import { isEmail } from "./is-email.js";

describe("isEmail", () => {
  test("should return true for valid email", () => {
    expect(isEmail("test@example.com")).toBe(true);
    expect(isEmail("user@example.co.uk")).toBe(true);
    expect(isEmail("firstName.lastname@example.com")).toBe(true);
  });

  test("should return false for invalid email", () => {
    expect(isEmail("invalid-email")).toBe(false);
    expect(isEmail("user.name+tag+sorting@example.com")).toBe(false);
    expect(isEmail("firstName..lastname@example.com")).toBe(false);
  });
});
