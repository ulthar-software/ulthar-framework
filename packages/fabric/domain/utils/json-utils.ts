import { PosixDate } from "@fabric/core";

export namespace JSONUtils {
  export function reviver(key: string, value: unknown) {
    if (PosixDate.isPosixDateJSON(value)) {
      return PosixDate.fromJson(value);
    }
    return value;
  }

  export function parse<T>(json: string): T {
    return JSON.parse(json, reviver);
  }
}
