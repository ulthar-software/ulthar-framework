/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Keyof } from "../../types/keyof.js";
import type { ModelToType } from "../models/index.js";
import {
  Field,
  Model,
  type ModelFields,
  type ModelOptions,
} from "../models/index.js";
import type { DomainEvent, EventToType } from "./event.js";

export class AggregateModel<
  const TName extends string = string,
  const TFields extends ModelFields = any,
> extends Model<TName, TFields & BaseAggregateFields> {
  constructor(
    name: TName,
    fields: TFields,
    opts: ModelOptions<Keyof<TFields & BaseAggregateFields>> = {},
  ) {
    const updatedFields = {
      ...BaseAggregateFields,
      ...fields,
    };
    super(name, updatedFields, opts);
  }

  from(
    event: EventToType<DomainEvent>,
    initialState: Omit<ModelToType<this>, Keyof<BaseAggregateFields>>,
  ): ModelToType<this> {
    return {
      id: event.streamId,
      version: 1n,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      ...initialState,
    } as ModelToType<this>;
  }

  update(
    aggregate: ModelToType<this>,
    event: EventToType<DomainEvent>,
    update: Partial<Omit<ModelToType<this>, Keyof<BaseAggregateFields>>>,
  ): ModelToType<this> {
    return {
      ...aggregate,
      version: event.version,
      updatedAt: event.timestamp,
      ...update,
    } as ModelToType<this>;
  }
}

export const BaseAggregateFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  version: Field.integer({
    hasArbitraryPrecision: true,
  }),
  createdAt: Field.posixDate(),
  updatedAt: Field.posixDate(),
};
export type BaseAggregateFields = typeof BaseAggregateFields;
