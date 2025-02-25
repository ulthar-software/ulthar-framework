/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModelToType } from "../models/model.js";
import type { AggregateModel } from "./aggregate.js";
import type { DomainEvent, EventToType } from "./event.js";

export type Projector<
  TEvent extends DomainEvent,
  TModel extends AggregateModel,
> = (
  event: EventToType<TEvent>,
  aggregate: ModelToType<TModel>,
) => ModelToType<TModel> | null;

// export type TupleToUnion<T extends readonly any[]> = {
//   [K in keyof T]: T[K];
// }[number];

export type Projections<
  TEvents extends DomainEvent,
  TModel extends AggregateModel,
> = {
  [K in TEvents["name"]]: Projector<Extract<TEvents, { name: K }>, TModel>;
};

export class AggregateProjector<
  TModel extends AggregateModel = any,
  const TEvents extends readonly DomainEvent[] = any,
> {
  constructor(
    readonly streamName: string,
    readonly model: TModel,
    readonly events: TEvents,
    readonly projections: Projections<TEvents[number], TModel>,
  ) {}
}
