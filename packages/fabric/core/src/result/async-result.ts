import { TaggedError } from "../error/tagged-error.js";
import { Result } from "./result.js";

/**
 * Un AsyncResult representa el resultado de una operación asíncrona que puede
 * resolver en un valor de tipo `TValue` o en un error de tipo `TError`.
 */
export type AsyncResult<
  TValue,
  TError extends TaggedError<string> = never,
> = Promise<Result<TValue, TError>>;
