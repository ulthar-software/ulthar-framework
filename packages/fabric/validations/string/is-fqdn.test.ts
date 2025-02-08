import { describe, expect, test } from "@fabric/testing";
import isFQDN from "./is-fqdn.ts";

describe("isFQDN", () => {
  test("should return true for valid FQDN", () => {
    expect(isFQDN("example.com")).toBe(true);
    expect(isFQDN("example.co.uk")).toBe(true);
    expect(isFQDN("example.ac.uk")).toBe(true);
  });

  test("should return false for invalid FQDN", () => {
    expect(isFQDN("example")).toBe(false);
    expect(isFQDN("example,com")).toBe(false);
    expect(isFQDN("example.")).toBe(false);
    expect(isFQDN(".example")).toBe(false);
    expect(isFQDN("example..com")).toBe(false);
    expect(isFQDN("ex_ample.com")).toBe(false);
    expect(isFQDN("example.com_")).toBe(false);
    expect(isFQDN("example.com ")).toBe(false);
    expect(isFQDN("examp le.com")).toBe(false);
  });
});
