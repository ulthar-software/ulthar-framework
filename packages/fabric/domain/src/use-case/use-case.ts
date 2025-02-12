import type { Effect, TaggedError, UnexpectedError } from "@fabric/core";

/**
 * A use case is a piece of domain logic that can be executed.
 */
export type UseCase<
  TDependencies,
  TPayload,
  TOutput,
  TErrors extends TaggedError,
> = TPayload extends undefined
  ? (dependencies: TDependencies) => Effect<TOutput, TErrors | UnexpectedError>
  : (
      dependencies: TDependencies,
      payload: TPayload,
    ) => Effect<TOutput, TErrors | UnexpectedError>;
