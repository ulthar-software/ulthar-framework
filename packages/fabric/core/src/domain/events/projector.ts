/* eslint-disable @typescript-eslint/no-explicit-any */
import type { ModelToType } from "../models/model.js";
import type { AggregateModel } from "./aggregate.js";
import type { DomainEvent, EventToType } from "./event.js";

export type CreateProjector<TEventKey extends string, TModel> = (
  event: EventToType<DomainEvent<TEventKey>>,
) => TModel;

export type UpdateProjector<TEventKey extends string, TModel> = (
  event: EventToType<DomainEvent<TEventKey>>,
  aggregate: TModel,
) => TModel;

export type DeleteProjector<TEventKey extends string> = (
  event: EventToType<DomainEvent<TEventKey>>,
) => null;

export type TupleToUnion<T extends readonly any[]> = {
  [K in keyof T]: T[K];
}[number];

export type Projections<TEvents extends DomainEvent, TModel> = {
  [K in TEvents["name"]]:
    | CreateProjector<K, TModel>
    | UpdateProjector<K, TModel>
    | DeleteProjector<K>;
};

export class AggregateProjector<
  TModel extends AggregateModel = any,
  const TEvents extends readonly DomainEvent[] = any,
> {
  constructor(
    readonly streamName: string,
    readonly model: TModel,
    readonly events: TEvents,
    readonly projections: Projections<
      TupleToUnion<TEvents>,
      ModelToType<TModel>
    >,
  ) {}
}
