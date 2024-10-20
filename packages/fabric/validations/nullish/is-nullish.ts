import { isNull } from "./is-null.ts";
import { isUndefined } from "./is-undefined.ts";

export function isNullish(value: unknown): value is null | undefined {
  return isNull(value) || isUndefined(value);
}
