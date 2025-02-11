import { UnexpectedError } from "../error/unexpected-error.js";

export function assert(
  condition: boolean,
  message?: string,
): asserts condition {
  if (!condition) {
    throw new UnexpectedError(message ?? "Assertion failed");
  }
}
