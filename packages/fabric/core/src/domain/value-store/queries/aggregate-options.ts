/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Keyof } from "../../../types/keyof.js";
import type { TaggedVariant } from "../../../variant/variant.js";

export type AggregateOptions<T = any> = Record<string, AggregateFn<T>>;

export type AggregateFn<T> = CountAggregate<T>;

export interface CountAggregate<T> extends TaggedVariant<"AggregateCount"> {
  field: Keyof<T>;
}
export interface SumAggregate<T> extends TaggedVariant<"AggregateSum"> {
  field: Keyof<T>;
}
export interface AvgAggregate<T> extends TaggedVariant<"AggregateAvg"> {
  field: Keyof<T>;
}

export interface MinAggregate<T> extends TaggedVariant<"AggregateMin"> {
  field: Keyof<T>;
}
export interface MaxAggregate<T> extends TaggedVariant<"AggregateMax"> {
  field: Keyof<T>;
}
