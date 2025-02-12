/* eslint-disable @typescript-eslint/no-explicit-any */
import type {
  Decimal,
  Email,
  PosixDate,
  TaggedVariant,
  UUID,
  VariantTag,
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
  enum: <K extends string, TOpts extends Omit<EnumField<K>, VariantTag>>(
    opts: TOpts,
  ) => variantConstructor<EnumField<K>>("EnumField")(opts),
  url: variantConstructor<UrlField>("UrlField"),
} as const satisfies Record<FieldShortName, any>;

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
  | BooleanField
  | EnumField<string>
  | UrlField;

// eslint-disable-next-line @typescript-eslint/no-unused-vars
const FieldShortNames = {
  StringField: "string",
  UUIDField: "uuid",
  IntegerField: "integer",
  FloatField: "float",
  DecimalField: "decimal",
  ReferenceField: "reference",
  PosixDateField: "posixDate",
  EmbeddedField: "embedded",
  BooleanField: "boolean",
  EmailField: "email",
  EnumField: "enum",
  UrlField: "url",
} as const satisfies Record<FieldDefinition["_tag"], string>;
type FieldShortName = (typeof FieldShortNames)[keyof typeof FieldShortNames];

/**
 * Converts a field definition to its corresponding TypeScript type.
 */
//prettier-ignore
export type FieldToType<TField> = 
  TField extends StringField ? MaybeOptional<TField, string>
  : TField extends UUIDField ? MaybeOptional<TField, UUID>
  : TField extends IntegerField ? IntegerFieldToType<TField>
  : TField extends ReferenceField ? MaybeOptional<TField, UUID>
  : TField extends DecimalField ? MaybeOptional<TField, Decimal>
  : TField extends FloatField ? MaybeOptional<TField, number>
  : TField extends PosixDateField ? MaybeOptional<TField, PosixDate>
  : TField extends BooleanField ? MaybeOptional<TField, boolean>
  : TField extends EmailField ? MaybeOptional<TField, Email>
  : TField extends EnumField<infer K> ? MaybeOptional<TField, K>
  : TField extends UrlField ? MaybeOptional<TField, string>
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
  extends TaggedVariant<"PosixDateField">,
    BaseField {}

export interface BooleanField
  extends TaggedVariant<"BooleanField">,
    BaseField {}

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
  extends TaggedVariant<"ReferenceField">,
    BaseField {
  targetModel: string;
  targetKey?: string;
}

export interface DecimalField extends TaggedVariant<"DecimalField">, BaseField {
  isUnsigned?: boolean;
  precision?: number;
  scale?: number;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export interface EmbeddedField<T = any>
  extends TaggedVariant<"EmbeddedField">,
    BaseField {}

export interface EnumField<TValues extends string>
  extends TaggedVariant<"EnumField">,
    BaseField {
  values: TValues[];
}

export interface UrlField extends TaggedVariant<"UrlField">, BaseField {}
