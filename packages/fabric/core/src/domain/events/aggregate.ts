/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Keyof } from "../../types/keyof.js";
import type { Infer } from "../models/index.js";
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
    initialState: Omit<Infer<this>, Keyof<BaseAggregateFields>>,
  ): Infer<this> {
    return {
      id: event.streamId,
      version: 1,
      createdAt: event.timestamp,
      updatedAt: event.timestamp,
      ...initialState,
    } as Infer<this>;
  }

  update(
    aggregate: Infer<this>,
    event: EventToType<DomainEvent>,
    update: Partial<Omit<Infer<this>, Keyof<BaseAggregateFields>>>,
  ): Infer<this> {
    return {
      ...aggregate,
      version: event.version,
      updatedAt: event.timestamp,
      ...update,
    } as Infer<this>;
  }
}

export const BaseAggregateFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  version: Field.integer({
    isUnsigned: true,
  }),
  createdAt: Field.posixDate(),
  updatedAt: Field.posixDate(),
};
export type BaseAggregateFields = typeof BaseAggregateFields;
