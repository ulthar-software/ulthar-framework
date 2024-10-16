import { isRecord } from "../record/is-record.ts";
import type { TaggedVariant } from "../variant/variant.ts";

export class PosixDate {
  constructor(public readonly timestamp: number = Date.now()) {}

  public toJSON(): PosixDateJSON {
    return {
      type: "posix-date",
      timestamp: this.timestamp,
    };
  }

  public static fromJson(json: PosixDateJSON): PosixDate {
    return new PosixDate(json.timestamp);
  }

  public static isPosixDateJSON(value: unknown): value is PosixDateJSON {
    if (
      isRecord(value) &&
      "type" in value &&
      "timestamp" in value &&
      value["type"] === "posix-date" &&
      typeof value["timestamp"] === "number"
    ) {
      return true;
    }
    return false;
  }
}

export interface TimeZone extends TaggedVariant<"TimeZone"> {
  timestamp: number;
}

export interface PosixDateJSON {
  type: "posix-date";
  timestamp: number;
}
