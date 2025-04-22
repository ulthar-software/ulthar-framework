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
