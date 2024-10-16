import { describe, expect, expectTypeOf, test } from "@fabric/testing";
import { isMimeType } from "./is-mime-type.ts";

describe("isMimeType", () => {
  test("should return true if the file type is the same as the mime type", () => {
    const fileType = "image/png" as string;
    const result = isMimeType("image/.*", fileType);
    expect(result).toBe(true);
    if (result) {
      expectTypeOf(fileType).toEqualTypeOf<"image/.*">();
    }
  });

  test("should return false if the file type is not the same as the mime type", () => {
    const fileType = "image/png" as string;
    expect(isMimeType("image/jpeg", fileType)).toBe(false);

    const anotherFileType = "file:image/jpeg" as string;
    expect(isMimeType("image/jpeg", anotherFileType)).toBe(false);
  });
});
