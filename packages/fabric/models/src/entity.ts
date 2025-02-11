import { Field } from "../src/fields.js";
import { Model, type ModelFields } from "../src/model.js";

export class EntityModel<
  TName extends string,
  TFields extends ModelFields,
> extends Model<TName, TFields & EntityFields> {
  constructor(name: TName, fields: TFields) {
    const updatedFields = {
      ...BaseEntityFields,
      ...fields,
    };
    super(name, updatedFields);
  }
}

export const BaseEntityFields = {
  id: Field.uuid({ isPrimaryKey: true }),
};
export type EntityFields = typeof BaseEntityFields;
