import { Field, FieldDefinition } from "./fields/index.js";

export type CustomModelFields = Record<string, FieldDefinition>;

export const DefaultModelFields = {
  id: Field.uuid({ isPrimaryKey: true }),
  streamId: Field.uuid({ isIndexed: true }),
  streamVersion: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: true,
  }),
};
export type Model<TFields extends CustomModelFields = CustomModelFields> =
  typeof DefaultModelFields & TFields;

export function defineModel<TFields extends CustomModelFields>(
  fields: TFields,
): Model<TFields> {
  return {
    ...fields,
    ...DefaultModelFields,
  } as const;
}
