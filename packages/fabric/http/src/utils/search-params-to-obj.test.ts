import { describe, expect, it } from "@fabric/testing";
import { searchParamsToObject } from "./search-params-to-object.js";

describe("Search params to object", () => {
  it("should convert search params to object", () => {
    const searchParams = new URLSearchParams();
    searchParams.append("key1", "value1");
    searchParams.append("key2", "value2");
    searchParams.append("key3", "value3");

    const obj = searchParamsToObject(searchParams);

    expect(obj).toEqual({
      key1: "value1",
      key2: "value2",
      key3: "value3",
    });
  });

  it("should convert search params to object with multiple values", () => {
    const searchParams = new URLSearchParams();
    searchParams.append("key1", "value1");
    searchParams.append("key1", "value2");
    searchParams.append("key1", "value3");

    const obj = searchParamsToObject(searchParams);

    expect(obj).toEqual({
      key1: ["value1", "value2", "value3"],
    });
  });
});
