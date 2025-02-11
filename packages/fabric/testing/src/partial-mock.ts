/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { vi } from "vitest";

export function partialMock<T>(opts: Partial<T>): T {
  const mock = {} as T;
  for (const key in opts) {
    if (typeof opts[key] === "function") {
      mock[key] = vi.fn(opts[key] as any) as any;
    } else {
      mock[key] = opts[key] as any;
    }
  }
  return mock;
}
