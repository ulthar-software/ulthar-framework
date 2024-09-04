import { TaggedError } from "../../error/tagged-error.js";
import { AsyncResult } from "../../result/async-result.js";

/**
 * A use case is a piece of domain logic that can be executed.
 *
 * It can be one of two types:
 *
 *  - `Query`: A use case that only reads data.
 *  - `Command`: A use case that modifies data.
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
