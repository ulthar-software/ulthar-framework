// deno-lint-ignore-file no-explicit-any
import type { TaggedError } from "../error/tagged-error.ts";
import { Result } from "../result/result.ts";
import type { MaybePromise } from "../types/maybe-promise.ts";
import type { MergeTypes } from "../types/merge-types.ts";

export class Effect<
  TDeps = void,
  TValue = any,
  TError extends TaggedError = never,
> {
  static from<TValue, TError extends TaggedError = never, TDeps = void>(
    fn: (deps: TDeps) => MaybePromise<Result<TValue, TError>>,
  ): Effect<TDeps, TValue, TError> {
    return new Effect(fn);
  }
  static tryFrom<TValue, TError extends TaggedError = never, TDeps = void>(
    fn: () => MaybePromise<TValue>,
    errorMapper: (error: any) => TError,
  ): Effect<TDeps, TValue, TError> {
    return new Effect(
      async () => {
        try {
          const value = await fn();
          return Result.ok(value);
        } catch (error) {
          return Result.failWith(errorMapper(error));
        }
      },
    );
  }

  static ok<TValue>(value: TValue): Effect<void, TValue, never> {
    return new Effect(() => Result.ok(value));
  }

  static failWith<TError extends TaggedError>(
    error: TError,
  ): Effect<void, never, TError> {
    return new Effect(() => Result.failWith(error));
  }

  constructor(
    private readonly fn: (
      deps: TDeps,
    ) => MaybePromise<Result<TValue, TError>>,
  ) {
  }

  map<TNewValue>(
    fn: (value: TValue) => MaybePromise<TNewValue>,
  ): Effect<TDeps, TNewValue, TError> {
    return new Effect(async (deps: TDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result;
      }
      return Result.ok(await fn(result.value as TValue));
    });
  }

  flatMap<TNewValue, TNewError extends TaggedError, TNewDeps = void>(
    fn: (
      value: TValue,
    ) => Effect<TNewDeps, TNewValue, TNewError>,
  ): Effect<MergeTypes<TDeps, TNewDeps>, TNewValue, TError | TNewError> {
    return new Effect(async (deps: TDeps & TNewDeps) => {
      const result = await this.fn(deps);
      if (result.isError()) {
        return result as Result<TNewValue, TError | TNewError>;
      }
      return await fn(result.value as TValue).fn(deps);
    }) as Effect<
      MergeTypes<TDeps, TNewDeps>,
      TNewValue,
      TError | TNewError
    >;
  }

  async run(deps: TDeps): Promise<Result<TValue, TError>> {
    return await this.fn(deps);
  }
}

export type ExtractEffectDependencies<T> = T extends
  Effect<infer TDeps, any, any> ? TDeps : never;
