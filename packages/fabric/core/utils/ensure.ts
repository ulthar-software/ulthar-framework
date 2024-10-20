import { UnexpectedError } from "../error/unexpected-error.ts";

export function ensure<T>(value?: T): T {
  if (!value) {
    throw new UnexpectedError("Value is nullish.");
  }
  return value;
}
