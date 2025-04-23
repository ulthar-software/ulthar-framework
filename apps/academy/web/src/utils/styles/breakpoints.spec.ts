import { describe, expect, it } from "vitest";
import { isBreakPointActive } from "./breakpoints.ts";

describe("Is breakpoint active", () => {
  it("should return true if the target breakpoint is active", () => {
    const targetBreakPoint = "sm";

    const currentBreakPoint = "md";

    const result = isBreakPointActive(targetBreakPoint, currentBreakPoint);

    expect(result).toBe(true);
  });
  it("should return false if the target breakpoint is NOT active", () => {
    const targetBreakPoint = "md";

    const currentBreakPoint = "sm";

    const result = isBreakPointActive(targetBreakPoint, currentBreakPoint);

    expect(result).toBe(false);
  });
});
