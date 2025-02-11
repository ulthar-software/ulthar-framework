import { UnexpectedError } from "../error/unexpected-error.js";

export function ensure<T>(value?: T): T {
  if (!value) {
    throw new UnexpectedError("Value is nullish.");
  }
  return value;
}
