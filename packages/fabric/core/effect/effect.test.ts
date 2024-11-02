import { describe, expect, expectTypeOf, fn, test } from "@fabric/testing";
import { UnexpectedError } from "../index.ts";
import { Result } from "../result/result.ts";
import { Effect, type ExtractEffectDependencies } from "./effect.ts";

describe("Effect", () => {
  test("Effect.from should create an Effect that returns a successful Result", async () => {
    const effect = Effect.from(() => Result.ok(42));
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.from should create an Effect that returns a failed Result with the correct error type and message", async () => {
    const effect = Effect.from(() =>
      Result.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.tryFrom should create an Effect that returns a successful Result", async () => {
    const effect = Effect.tryFrom(
      () => Promise.resolve(42),
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.tryFrom should create an Effect that returns a failed Result with the correct error type and message", async () => {
    const effect = Effect.tryFrom(
      () => Promise.reject(new Error("failure")),
      (e) => new UnexpectedError(e.message),
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.ok should create an Effect that returns a successful Result", async () => {
    const effect = Effect.ok(42);
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(42);
  });

  test("Effect.failWith should create an Effect that returns a failed Result with the correct error type and message", async () => {
    const effect = Effect.failWith(new UnexpectedError("failure"));
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.map should map a successful Result to a new successful Result", async () => {
    const effect = Effect.ok(42).map((value) => value * 2);
    const result = await effect.run();
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(84);
  });

  test("Effect.map should skip maps when the Result is an error", async () => {
    const mockFn = fn() as () => number;
    const effect = Effect.failWith(new UnexpectedError("failure")).map(
      mockFn,
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(mockFn).not.toHaveBeenCalled();
  });

  test(
    "Effect.flatMap should map a successful Effect to a new Effect",
    async () => {
      const effect = Effect.ok(42).flatMap((value) => Effect.ok(value * 2));
      const result = await effect.run();
      expect(result.isOk()).toBe(true);
      expect(result.unwrapOrThrow()).toBe(84);
    },
  );

  test("Effect.flatMap should map a successful Effect to a new failed Effect", async () => {
    const effect = Effect.ok(42).flatMap(() =>
      Effect.failWith(new UnexpectedError("failure"))
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
  });

  test("Effect.flatMap should skip maps when the Result is an error", async () => {
    const mockFn = fn() as () => Effect<void, number, UnexpectedError>;
    const effect = Effect.failWith(new UnexpectedError("failure")).flatMap(
      mockFn,
    );
    const result = await effect.run();
    expect(result.isError()).toBe(true);
    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(UnexpectedError);
    expect(result.unwrapErrorOrThrow().message).toBe("failure");
    expect(mockFn).not.toHaveBeenCalled();
  });

  test("Effect.flatMap should result in an effect which requires both dependencies", async () => {
    const effect = Effect.from(({ a }: { a: number }) => Result.ok(a * 2))
      .flatMap((value) =>
        Effect.from(({ b }: { b: number }) => Result.ok(value + b))
      );

    const result = await effect.run({ a: 1, b: 2 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(4);

    //This should fail to compile
    //await effect.run({ a: 1 });

    type Deps = ExtractEffectDependencies<typeof effect>;

    expectTypeOf<Deps>().toEqualTypeOf<{ a: number } & { b: number }>();
  });

  test("Effect.flatMap should work if an effect has dependencies and the other effect does not", async () => {
    const effect = Effect.from(({ a }: { a: number }) => Result.ok(a * 2))
      .flatMap((value) => Effect.ok(value + 2));

    const result = await effect.run({ a: 1 });
    expect(result.isOk()).toBe(true);
    expect(result.unwrapOrThrow()).toBe(4);

    type Deps = ExtractEffectDependencies<typeof effect>;

    expectTypeOf<Deps>().toEqualTypeOf<{ a: number }>();
  });
});
