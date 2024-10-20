import type { UUID } from "@fabric/core";
import { isString } from "./is-string.ts";

// From https://github.com/uuidjs/uuid/blob/main/src/regex.ts
const uuidRegex =
  /^(?:[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}|00000000-0000-0000-0000-000000000000|ffffffff-ffff-ffff-ffff-ffffffffffff)$/i;

export function isUUID(value: unknown): value is UUID {
  return isString(value) && uuidRegex.test(value);
}
