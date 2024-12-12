import { Effect } from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { UnexpectedError } from "../error/unexpected-error.ts";
import { Run } from "./run.ts";

describe("Run", () => {
  test("Run.seq should pipe the results of multiple async functions", async () => {
    const result = await Run.seq(
      () => Effect.ok(1),
      (x) => Effect.ok(x + 1),
      (x) => Effect.ok(x * 2),
    );

    expect(result.unwrapOrThrow()).toEqual(4);
  });

  test("Run.seq should return the first error if one of the functions fails", async () => {
    const result = await Run.seq(
      () => Effect.ok(1),
      () => Effect.failWith(new UnexpectedError()),
      (x) => Effect.ok(x * 2),
    );

    expect(result.isError()).toBe(true);
  });

  test("Run.seq should handle multiple functions with different types", async () => {
    const result = await Run.seq(
      () => Effect.ok(1),
      (x) => Effect.ok(x.toString()),
      (x) => Effect.ok(x + "!"),
    );

    expect(result.unwrapOrThrow()).toEqual("1!");
  });

  test("Run.seqOrThrow should pipe the results of multiple async functions", async () => {
    const result = await Run.seqOrThrow(
      () => Effect.ok(1),
      (x) => Effect.ok(x + 1),
      (x) => Effect.ok(x * 2),
    );

    expect(result).toEqual(4);
  });

  test("Run.seqOrThrow should throw an error if one of the functions fails", async () => {
    await expect(Run.seqOrThrow(
      () => Effect.ok(1),
      () => Effect.failWith(new UnexpectedError()),
      (x) => Effect.ok(x * 2),
    )).rejects.toThrow(UnexpectedError);
  });

  test("Run.seqOrThrow should handle multiple functions with different types", async () => {
    const result = await Run.seqOrThrow(
      () => Effect.ok(1),
      (x) => Effect.ok(x.toString()),
      (x) => Effect.ok(x + "!"),
    );

    expect(result).toEqual("1!");
  });
});
