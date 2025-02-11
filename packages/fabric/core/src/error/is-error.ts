import { TaggedError } from "./tagged-error.js";

/**
 * Indicates if a value is an error.
 */
export function isError(err: unknown): err is TaggedError {
  return err instanceof TaggedError;
}
