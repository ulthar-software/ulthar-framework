/* eslint-disable @typescript-eslint/no-unnecessary-condition */

import { describe, expect, test } from "vitest";
import { clx } from "./clx.js";

describe("clx", () => {
  test("given a some default classes and some dynamic classes should return the correct string", () => {
    const someValue = "thing";
    const someOtherValue = "other thing";
    const result = clx(
      "default-class-1 default-class-2",
      someValue && "dynamic-class-1",
      !someOtherValue && "dynamic-class-2",
    );

    expect(result).toBe("default-class-1 default-class-2 dynamic-class-1");
  });
});
