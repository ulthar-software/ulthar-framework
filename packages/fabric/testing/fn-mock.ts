import { fn } from "@std/expect";

// deno-lint-ignore no-explicit-any
export function fnMock<T extends (...args: any[]) => any>(mock?: T): T {
  return fn(mock!) as T;
}
