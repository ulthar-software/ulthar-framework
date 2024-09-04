import { describe, expect, expectTypeOf, it } from "vitest";
import { isMimeType } from "./is-mime-type.js";

describe("isMimeType", () => {
  it("should return true if the file type is the same as the mime type", () => {
    const fileType = "image/png" as string;
    const result = isMimeType("image/.*", fileType);
    expect(result).toBe(true);
    if (result) {
      expectTypeOf(fileType).toEqualTypeOf<"image/.*">();
    }
  });

  it("should return false if the file type is not the same as the mime type", () => {
    const fileType = "image/png" as string;
    expect(isMimeType("image/jpeg", fileType)).toBe(false);

    const anotherFileType = "file:image/jpeg" as string;
    expect(isMimeType("image/jpeg", anotherFileType)).toBe(false);
  });
});
