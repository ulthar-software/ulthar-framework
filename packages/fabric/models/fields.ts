// deno-lint-ignore-file no-explicit-any
import type {
  Decimal,
  Email,
  PosixDate,
  TaggedVariant,
  UUID,
} from "@fabric/core";
import { variantConstructor } from "@fabric/core";

export const Field = {
  string: variantConstructor<StringField>("StringField"),
  uuid: variantConstructor<UUIDField>("UUIDField"),
  integer: variantConstructor<IntegerField>("IntegerField"),
  float: variantConstructor<FloatField>("FloatField"),
  decimal: variantConstructor<DecimalField>("DecimalField"),
  reference: variantConstructor<ReferenceField>("ReferenceField"),
  posixDate: variantConstructor<PosixDateField>("PosixDateField"),
  embedded: variantConstructor<EmbeddedField>("EmbeddedField"),
  boolean: variantConstructor<BooleanField>("BooleanField"),
  email: variantConstructor<EmailField>("EmailField"),
} as const;

export type FieldDefinition =
  | StringField
  | UUIDField
  | IntegerField
  | FloatField
  | DecimalField
  | ReferenceField
  | PosixDateField
  | EmbeddedField
  | EmailField
  | BooleanField;

/**
 * Converts a field definition to its corresponding TypeScript type.
 */
//prettier-ignore
export type FieldToType<TField> = TField extends StringField
  ? MaybeOptional<TField, string>
  : TField extends UUIDField ? MaybeOptional<TField, UUID>
  : TField extends IntegerField ? IntegerFieldToType<TField>
  : TField extends ReferenceField ? MaybeOptional<TField, UUID>
  : TField extends DecimalField ? MaybeOptional<TField, Decimal>
  : TField extends FloatField ? MaybeOptional<TField, number>
  : TField extends PosixDateField ? MaybeOptional<TField, PosixDate>
  : TField extends BooleanField ? MaybeOptional<TField, boolean>
  : TField extends EmailField ? MaybeOptional<TField, Email>
  : TField extends EmbeddedField<infer TSubModel>
    ? MaybeOptional<TField, TSubModel>
  : never;

//prettier-ignore
type IntegerFieldToType<TField extends IntegerField> =
  TField["hasArbitraryPrecision"] extends true ? MaybeOptional<TField, bigint>
    : TField["hasArbitraryPrecision"] extends false
      ? MaybeOptional<TField, number>
    : MaybeOptional<TField, number | bigint>;

type MaybeOptional<TField, TType> = TField extends { isOptional: true }
  ? TType | undefined
  : TType;

interface BaseField {
  isOptional?: boolean;
  isUnique?: boolean;
  isIndexed?: boolean;
}

export interface UUIDField extends TaggedVariant<"UUIDField">, BaseField {
  isPrimaryKey?: boolean;
}

export interface PosixDateField
  extends TaggedVariant<"PosixDateField">, BaseField {}

export interface BooleanField
  extends TaggedVariant<"BooleanField">, BaseField {}

export interface StringField extends TaggedVariant<"StringField">, BaseField {
  maxLength?: number;
  minLength?: number;
}

export interface EmailField extends TaggedVariant<"EmailField">, BaseField {}

export interface IntegerField extends TaggedVariant<"IntegerField">, BaseField {
  isUnsigned?: boolean;
  hasArbitraryPrecision?: boolean;
}

export interface FloatField extends TaggedVariant<"FloatField">, BaseField {}

export interface ReferenceField
  extends TaggedVariant<"ReferenceField">, BaseField {
  targetModel: string;
  targetKey?: string;
}

export interface DecimalField extends TaggedVariant<"DecimalField">, BaseField {
  isUnsigned?: boolean;
  precision?: number;
  scale?: number;
}

export interface EmbeddedField<T = any>
  extends TaggedVariant<"EmbeddedField">, BaseField {}
