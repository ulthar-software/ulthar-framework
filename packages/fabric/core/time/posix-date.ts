import {
  JSONSerializedType,
  JSONTypeTransformer,
} from "../json/json-transformer.ts";
import type { TaggedVariant } from "../variant/variant.ts";

export class PosixDate {
  constructor(public readonly timestamp: number = Date.now()) {}
}

export interface TimeZone extends TaggedVariant<"TimeZone"> {
  timestamp: number;
}

export type JSONSerializedPosixDate = JSONSerializedType<
  "posix-date",
  number
>;

export const posixDateTransformer: JSONTypeTransformer<
  "posix-date",
  number,
  PosixDate
> = {
  _type: "posix-date",
  deserialize: (value: number) => new PosixDate(value),
  serialize: (value: PosixDate) => ({
    _type: "posix-date",
    value: value.timestamp,
  }),
  typeMatches: (value: unknown) => value instanceof PosixDate,
};
