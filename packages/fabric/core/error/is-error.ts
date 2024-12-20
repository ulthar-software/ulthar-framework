import { TaggedError } from "./tagged-error.ts";

/**
 * Indicates if a value is an error.
 */
export function isError(err: unknown): err is TaggedError<string> {
  return err instanceof TaggedError;
}
