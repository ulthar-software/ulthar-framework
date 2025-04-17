/* eslint-disable @typescript-eslint/no-explicit-any */
import { UnexpectedError } from "../../error/unexpected-error.js";
import { Result } from "../../result/result.js";
import type { Infer } from "../models/index.js";
import type { AggregateModel } from "./aggregate.js";
import type { DomainEvent, EventToType } from "./event.js";

export type Projector<
  TEvent extends DomainEvent,
  TModel extends AggregateModel,
> = (
  event: EventToType<TEvent>,
  aggregate: Infer<TModel>,
) => Infer<TModel> | null;

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

  project(
    event: EventToType<TEvents[number]>,
    model?: Infer<TModel>,
  ): Result<Infer<TModel> | null, UnexpectedError> {
    try {
      const projector = this.projections[event.type] as
        | ((
            event: EventToType<TEvents[number]>,
            model?: Infer<TModel>,
          ) => Infer<TModel> | null)
        | undefined;

      if (projector) {
        const projected = projector(event, model);

        if (projected) {
          return Result.ok(projected);
        } else {
          return Result.ok(null);
        }
      } else {
        return Result.failWith(
          new UnexpectedError(`No projector found for the event ${event.type}`),
        );
      }
    } catch (error) {
      return Result.failWith(new UnexpectedError((error as Error).message));
    }
  }
}
