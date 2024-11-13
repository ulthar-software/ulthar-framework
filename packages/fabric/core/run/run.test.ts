import { Effect } from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { Run } from "./run.ts";

describe("Run", () => {
  describe("In Sequence", () => {
    test("should pipe the results of multiple async functions", async () => {
      const result = await Run.seq(
        () => Effect.ok(1),
        (x) => Effect.ok(x + 1),
        (x) => Effect.ok(x * 2),
      );

      expect(result.unwrapOrThrow()).toEqual(4);
    });

    test("should return the first error if one of the functions fails", async () => {
      const result = await Run.seq(
        () => Effect.ok(1),
        () => Effect.failWith(new UnexpectedError()),
        (x) => Effect.ok(x * 2),
      );

      expect(result.isError()).toBe(true);
    });
  });
});
