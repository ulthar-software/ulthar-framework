import { TaggedError } from "../error/tagged-error.js";
import { UnexpectedError } from "../error/unexpected-error.js";

/**
 * Un Result representa el resultado de una operación
 * que puede ser un valor de tipo `TValue` o un error `TError`.
 */
export type Result<
  TValue,
  TError extends TaggedError<string> = UnexpectedError,
> = TValue | TError;
