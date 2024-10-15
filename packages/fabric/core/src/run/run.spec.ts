import { describe, expect, it } from "vitest";
import { UnexpectedError } from "../error/unexpected-error.js";
import { Result } from "../result/result.js";
import { Run } from "./run.js";

describe("Run", () => {
  describe("In Sequence", () => {
    it("should pipe the results of multiple async functions", async () => {
      const result = await Run.seq(
        async () => Result.succeedWith(1),
        async (x) => Result.succeedWith(x + 1),
        async (x) => Result.succeedWith(x * 2),
      );

      expect(result.unwrapOrThrow()).toEqual(4);
    });

    it("should return the first error if one of the functions fails", async () => {
      const result = await Run.seq(
        async () => Result.succeedWith(1),
        async () => Result.failWith(new UnexpectedError()),
        async (x) => Result.succeedWith(x * 2),
      );

      expect(result.isError()).toBe(true);
    });
  });
});
