import { vi } from "vitest";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function fnMock<T extends (...args: any[]) => any>(mock?: T): T {
  return vi.fn(mock) as unknown as T;
}
