import { isNull } from "./is-null.js";
import { isUndefined } from "./is-undefined.js";

export function isNullish(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}
