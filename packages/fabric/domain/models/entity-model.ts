import type { CustomModelFields } from "./custom-model-fields.ts";
import { Field } from "./fields/index.ts";
import type { Model } from "./model.ts";

export const DefaultEntityFields = {
  id: Field.uuid({ isPrimaryKey: true }),
};

export interface EntityModel<
  TName extends string = string,
  TFields extends CustomModelFields = CustomModelFields,
> extends Model<TName, TFields> {
  fields: typeof DefaultEntityFields & TFields;
}
