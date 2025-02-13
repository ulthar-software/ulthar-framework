import {
  Field,
  Model,
  type ModelFields,
  type ModelOptions,
} from "@fabric/models";

export class AggregateModel<
  TName extends string = string,
  TFields extends ModelFields = ModelFields,
> extends Model<TName, TFields & BaseAggregateFields> {
  constructor(name: TName, fields: TFields, opts: ModelOptions = {}) {
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
