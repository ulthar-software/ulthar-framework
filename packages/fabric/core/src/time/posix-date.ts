import { TaggedVariant } from "../variant/variant.js";

export class PosixDate {
  constructor(public readonly timestamp: number) {}
}

export interface TimeZone extends TaggedVariant<"TimeZone"> {
  timestamp: number;
}
