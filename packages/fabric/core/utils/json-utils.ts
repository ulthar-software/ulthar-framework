import { isRecord, PosixDate } from "@fabric/core";
import Decimal from "decimal";

export namespace JSONUtils {
  export function reviver(key: string, value: unknown) {
    if (isRecord(value)) {
      if (value._type === "bigint" && typeof value.value == "string") {
        return BigInt(value.value);
      }

      if (value._type === "decimal" && typeof value.value == "string") {
        return Decimal.from(value.value);
      }

      if (PosixDate.isPosixDateJSON(value)) {
        return PosixDate.fromJson(value);
      }
    }
    return value;
  }

  export function parse<T>(json: string): T {
    return JSON.parse(json, reviver);
  }

  export function stringify<T>(value: T): string {
    return JSON.stringify(value, (key, value) => {
      if (typeof value === "bigint") {
        return {
          _type: "bigint",
          value: value.toString(),
        };
      }
      if (value instanceof Decimal) {
        return {
          _type: "decimal",
          value: value.toString(),
        };
      }
      return value;
    });
  }
}
