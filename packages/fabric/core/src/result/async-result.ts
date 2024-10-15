/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedError } from "../error/tagged-error.js";
import { UnexpectedError } from "../error/unexpected-error.js";
import { MaybePromise } from "../types/maybe-promise.js";
import { Result } from "./result.js";

/**
 * An AsyncResult represents the result of an asynchronous operation that can
 * resolve to a value of type `TValue` or an error of type `TError`.
 */
export type AsyncResult<
  TValue = any,
  TError extends TaggedError = never,
> = Promise<Result<TValue, TError>>;

export namespace AsyncResult {
  export async function tryFrom<T, TError extends TaggedError>(
    fn: () => MaybePromise<T>,
    errorMapper: (error: any) => TError,
  ): AsyncResult<T, TError> {
    try {
      return Result.succeedWith(await fn());
    } catch (error) {
      return Result.failWith(errorMapper(error));
    }
  }

  export async function from<T>(
    fn: () => MaybePromise<T>,
  ): AsyncResult<T, never> {
    return tryFrom(fn, (error) => new UnexpectedError(error) as never);
  }
}
