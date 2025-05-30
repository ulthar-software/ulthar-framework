import type {
  JSONSerializedType,
  JSONTypeTransformer,
} from "../json/json-transformer.js";
import type { TaggedVariant } from "../variant/variant.js";

export class PosixDate {
  constructor(public readonly timestamp: number = Date.now()) {}

  public getTimeString(): string {
    return new Date(this.timestamp).toISOString().split("T")[1].split(".")[0];
  }

  public getDateString(): string {
    return new Date(this.timestamp).toISOString().split("T")[0];
  }

  public getIsoString(): string {
    return new Date(this.timestamp).toISOString();
  }

  public static now(): PosixDate {
    return new PosixDate();
  }

  public static fromIsoString(dateString: string): PosixDate {
    const date = new Date(dateString);
    if (isNaN(date.getTime())) {
      throw new Error(`Invalid date string: ${dateString}`);
    }
    return new PosixDate(date.getTime());
  }

  public add(milliseconds: number): PosixDate {
    return new PosixDate(this.timestamp + milliseconds);
  }

  public isBefore(other: PosixDate): boolean {
    return this.timestamp < other.timestamp;
  }
  public isAfter(other: PosixDate): boolean {
    return this.timestamp > other.timestamp;
  }

  public formatDate(
    lang: Intl.LocalesArgument,
    opts?: Intl.DateTimeFormatOptions,
  ): string {
    return new Date(this.timestamp).toLocaleDateString(lang, opts);
  }

  public formatTime(
    lang: Intl.LocalesArgument,
    opts?: Intl.DateTimeFormatOptions,
  ): string {
    return new Date(this.timestamp).toLocaleTimeString(lang, opts);
  }
}

export interface TimeZone extends TaggedVariant<"TimeZone"> {
  timestamp: number;
}

export type JSONSerializedPosixDate = JSONSerializedType<"posix-date", number>;

export const posixDateTransformer: JSONTypeTransformer<
  "posix-date",
  number,
  PosixDate
> = {
  _type: "posix-date",
  deserialize: (value: unknown) => {
    if (typeof value !== "number") {
      throw new Error("serialized PosixDate value must be a number");
    }
    return new PosixDate(value);
  },
  serialize: (value: PosixDate) => ({
    _type: "posix-date",
    value: value.timestamp,
  }),
  typeMatches: (value: unknown) => value instanceof PosixDate,
};
