import { Field, Model, ModelFields } from "@fabric/models";
import { DomainEvent } from "./event.ts";
export class Aggregate<
  TName extends string,
  TFields extends ModelFields,
> extends Model<TName, TFields & AggregateBaseFields> {
  constructor(name: TName, fields: TFields) {
    const updatedFields = {
      ...AggregateBaseFields,
      ...fields,
    };
    super(name, updatedFields);
  }
}

export interface Projection<
  TEvents extends DomainEvent,
  TAggregate extends Aggregate<string, ModelFields>,
> {
  project(event: TEvents, model?: TAggregate): TAggregate;
  projectMany(events: TEvents[], model?: TAggregate): TAggregate;
  projectAll(events: TEvents[]): TAggregate[];
}

export type ProjectionFn<
  TEvents extends DomainEvent,
  TAggregate extends Aggregate<string, ModelFields>,
> = (event: TEvents, model?: TAggregate) => TAggregate;

export const AggregateBaseFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  streamVersion: Field.integer({ hasArbitraryPrecision: true }),
  createdAt: Field.posixDate({}),
  updatedAt: Field.posixDate({}),
  deletedAt: Field.posixDate({ isOptional: true }),
} as const;
export type AggregateBaseFields = typeof AggregateBaseFields;
