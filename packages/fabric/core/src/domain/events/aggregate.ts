/* eslint-disable @typescript-eslint/no-explicit-any */
import type { Keyof } from "../../types/keyof.js";
import {
  Field,
  Model,
  type ModelFields,
  type ModelOptions,
} from "../models/index.js";

export class AggregateModel<
  TName extends string = string,
  TFields extends ModelFields = any,
> extends Model<TName, TFields & BaseAggregateFields> {
  constructor(
    name: TName,
    fields: TFields,
    opts: ModelOptions<Keyof<TFields>> = {},
  ) {
    const updatedFields = {
      ...BaseAggregateFields,
      ...fields,
    };
    super(name, updatedFields, opts);
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
