import { describe, expect, expectTypeOf, it, vitest } from "vitest";
import { UnexpectedError } from "../error/unexpected-error.js";
import { Result } from "./result.js";

describe("Result", () => {
  describe("isOk", () => {
    it("should return true if the result is ok", () => {
      const result = Result.succeedWith(1) as Result<number, UnexpectedError>;

      expect(result.isOk()).toBe(true);

      if (result.isOk()) {
        expect(result.value).toEqual(1);

        expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
      }
    });
  });

  describe("isError", () => {
    it("should return true if the result is an error", () => {
      const result = Result.failWith(new UnexpectedError()) as Result<
        number,
        UnexpectedError
      >;

      expect(result.isError()).toBe(true);

      if (result.isError()) {
        expect(result.value).toBeInstanceOf(UnexpectedError);

        expectTypeOf(result).toEqualTypeOf<Result<never, UnexpectedError>>();
      }
    });
  });

  describe("Map", () => {
    it("should return the result of the last function", () => {
      const x = 0;

      const result = Result.succeedWith(x + 1).map((x) => x * 2);

      expect(result.unwrapOrThrow()).toEqual(2);

      expectTypeOf(result).toEqualTypeOf<Result<number, never>>();
    });

    it("should not execute the function if the result is an error", () => {
      const fn = vitest.fn();
      const result = Result.failWith(new UnexpectedError()).map(fn);

      expect(result.isError()).toBe(true);

      expect(fn).not.toHaveBeenCalled();
    });
  });
});
