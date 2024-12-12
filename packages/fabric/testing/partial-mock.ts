// deno-lint-ignore-file no-explicit-any
import { fn } from "@std/expect";

export function partialMock<T>(opts: Partial<T>): T {
  const mock = {} as T;
  for (const key in opts) {
    if (typeof opts[key] === "function") {
      mock[key] = fn(opts[key]) as any;
    } else {
      mock[key] = opts[key] as any;
    }
  }
  return mock;
}
