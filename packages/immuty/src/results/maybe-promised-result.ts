import { TaggedError } from "../errors/tagged-error.js";
import { Result } from "./result.js";

/**
 * Represents a Result that may be wrapped in a Promise.
 */
export type MaybePromisedResult<
    A,
    AErr extends TaggedError,
> = A extends Promise<infer T> ? Promise<Result<T, AErr>> : Result<A, AErr>;
