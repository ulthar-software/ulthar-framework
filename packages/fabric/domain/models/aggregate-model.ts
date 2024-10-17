import type { Keyof } from "../../core/index.ts";
import type { CustomModelFields } from "./custom-model-fields.ts";
import { DefaultEntityFields, type EntityModel } from "./entity-model.ts";
import { Field } from "./fields/index.ts";

export const DefaultAggregateFields = {
  ...DefaultEntityFields,
  streamId: Field.uuid({ isIndexed: true }),
  streamVersion: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: true,
  }),
  deletedAt: Field.timestamp({ isOptional: true }),
};

export interface AggregateModel<
  TName extends string = string,
  TFields extends CustomModelFields = CustomModelFields,
> extends EntityModel<TName, TFields> {
  fields: typeof DefaultAggregateFields & TFields;
}

export function defineAggregateModel<
  TName extends string,
  TFields extends CustomModelFields,
>(name: TName, fields: TFields): AggregateModel<TName, TFields> {
  return {
    name,
    fields: { ...DefaultAggregateFields, ...fields },
  } as const;
}

export type ModelAddressableFields<TModel extends AggregateModel> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends { isUnique: true }
    ? K
    : never;
}[Keyof<TModel["fields"]>];
