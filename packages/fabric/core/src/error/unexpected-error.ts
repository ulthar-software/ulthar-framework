import { TaggedError } from "./tagged-error.js";

/**
 * `UnexpectedError` represents any type of unexpected error.
 *
 * This error is used to represent errors that should not occur in
 * the application logic, but that could always happen and
 * we must be prepared to handle.
 */
export class UnexpectedError extends TaggedError<"UnexpectedError"> {
  constructor() {
    super("UnexpectedError");
  }
}
