// deno-lint-ignore-file no-namespace no-explicit-any no-async-promise-executor
import { UnexpectedError } from "@fabric/core";
import type { TaggedError } from "../error/tagged-error.ts";
import type { MaybePromise } from "../types/maybe-promise.ts";
import { Result } from "./result.ts";

/**
 * An AsyncResult represents the result of an asynchronous operation that can
 * resolve to a value of type `TValue` or an error of type `TError`.
 */
export class AsyncResult<
  TValue = any,
  TError extends TaggedError = never,
> {
  static tryFrom<T, TError extends TaggedError>(
    fn: () => MaybePromise<T>,
    errorMapper: (error: any) => TError,
  ): AsyncResult<T, TError> {
    return new AsyncResult(
      new Promise<Result<T, TError>>(async (resolve) => {
        try {
          const value = await fn();
          resolve(Result.ok(value));
        } catch (error) {
          resolve(Result.failWith(errorMapper(error)));
        }
      }),
    );
  }

  static from<T>(fn: () => MaybePromise<T>): AsyncResult<T, never> {
    return AsyncResult.tryFrom(
      fn,
      (error) => new UnexpectedError(error) as never,
    );
  }

  static ok(): AsyncResult<void, never>;
  static ok<T>(value: T): AsyncResult<T, never>;
  static ok(value?: any) {
    return new AsyncResult(Promise.resolve(Result.ok(value)));
  }

  static succeedWith = AsyncResult.ok;

  static failWith<TError extends TaggedError>(
    error: TError,
  ): AsyncResult<never, TError> {
    return new AsyncResult(Promise.resolve(Result.failWith(error)));
  }

  private constructor(private r: Promise<Result<TValue, TError>>) {
  }

  promise(): Promise<Result<TValue, TError>> {
    return this.r;
  }

  async unwrapOrThrow(): Promise<TValue> {
    return (await this.r).unwrapOrThrow();
  }

  async orThrow(): Promise<void> {
    return (await this.r).orThrow();
  }

  async unwrapErrorOrThrow(): Promise<TError> {
    return (await this.r).unwrapErrorOrThrow();
  }

  /**
   * Map a function over the value of the result.
   */
  map<TMappedValue>(
    fn: (value: TValue) => TMappedValue,
  ): AsyncResult<TMappedValue, TError> {
    return new AsyncResult(
      this.r.then((result) => result.map(fn)),
    );
  }

  /**
   * Maps a function over the value of the result and flattens the result.
   */
  flatMap<TMappedValue, TMappedError extends TaggedError>(
    fn: (value: TValue) => AsyncResult<TMappedValue, TMappedError>,
  ): AsyncResult<TMappedValue, TError | TMappedError> {
    return new AsyncResult(
      this.r.then((result) => {
        if (result.isError()) {
          return result as any;
        }

        return (fn(result.unwrapOrThrow())).promise();
      }),
    );
  }

  /**
   * Try to map a function over the value of the result.
   * If the function throws an error, the result will be a failure.
   */
  tryMap<TMappedValue>(
    fn: (value: TValue) => TMappedValue,
    errMapper: (error: any) => TError,
  ): AsyncResult<TMappedValue, TError> {
    return new AsyncResult(
      this.r.then((result) => result.tryMap(fn, errMapper)),
    );
  }

  /**
   * Map a function over the error of the result.
   */
  errorMap<TMappedError extends TaggedError>(
    fn: (error: TError) => TMappedError,
  ): AsyncResult<TValue, TMappedError> {
    return new AsyncResult(
      this.r.then((result) => result.errorMap(fn)),
    );
  }

  /**
   * Execute a function if the result is not an error.
   * The function does not affect the result.
   */
  tap(fn: (value: TValue) => void): AsyncResult<TValue, TError> {
    return new AsyncResult(
      this.r.then((result) => result.tap(fn)),
    );
  }

  assert<TResultValue, TResultError extends TaggedError>(
    fn: (value: TValue) => AsyncResult<TResultValue, TResultError>,
  ): AsyncResult<TValue, TError | TResultError> {
    return new AsyncResult(
      this.r.then((result) => {
        if (result.isError()) {
          return result as any;
        }

        return (fn(result.unwrapOrThrow())).promise();
      }),
    );
  }
}
