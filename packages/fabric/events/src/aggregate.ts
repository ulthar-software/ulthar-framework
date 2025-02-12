import { Field, Model, type ModelFields } from "@fabric/models";

export class AggregateModel<
  TName extends string,
  TFields extends ModelFields,
> extends Model<TName, TFields & BaseAggregateFields> {
  constructor(name: TName, fields: TFields) {
    const updatedFields = {
      ...BaseAggregateFields,
      ...fields,
    };
    super(name, updatedFields);
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
