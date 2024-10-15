import { UnexpectedError } from "../error/unexpected-error.js";

export function ensureValue<T>(value?: T): T {
  if (!value) {
    throw new UnexpectedError("Value is undefined");
  }
  return value;
}
