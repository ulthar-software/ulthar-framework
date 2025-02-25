/* eslint-disable @typescript-eslint/no-explicit-any */
import type { TupleToUnion } from "../../types/tuple-to-union.js";
import type { DomainEvent } from "./event.js";

export interface EventNames<
  TCreateTag extends string = string,
  TUpdateTag extends string = string,
  TDeleteTag extends string = string,
> {
  createEvents: TCreateTag[];
  updateEvents: TUpdateTag[];
  deleteEvents: TDeleteTag[];
}

export class EventStream<
  const TName extends string = string,
  const TEvents extends readonly DomainEvent[] = readonly DomainEvent[],
> {
  constructor(
    readonly name: TName,
    readonly events: TEvents,
  ) {}
}

export type PossibleEvents<T extends EventStream<any, any>> =
  T extends EventStream<any, infer TEvents> ? TupleToUnion<TEvents> : never;

export type EventStreamFromName<
  T extends EventStream<any, any>,
  TName extends T["name"],
> = Extract<T, { name: TName }>;
