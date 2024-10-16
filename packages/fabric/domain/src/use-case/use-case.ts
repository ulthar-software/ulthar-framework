import type { AsyncResult, TaggedError } from "@fabric/core";

/**
 * A use case is a piece of domain logic that can be executed.
 */
export type UseCase<
  TDependencies,
  TPayload,
  TOutput,
  TErrors extends TaggedError<string>,
> = TPayload extends undefined
  ? (dependencies: TDependencies) => AsyncResult<TOutput, TErrors>
  : (
    dependencies: TDependencies,
    payload: TPayload,
  ) => AsyncResult<TOutput, TErrors>;
