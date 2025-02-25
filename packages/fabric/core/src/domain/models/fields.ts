/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Decimal } from "../../decimal/decimal.js";
import type { PosixDate } from "../../time/posix-date.js";
import type { Email } from "../../types/email.js";
import type { UUID } from "../../types/uuid.js";
import { variantConstructor } from "../../variant/constructor.js";
import type { TaggedVariant } from "../../variant/variant.js";
import { VariantTag } from "../../variant/variant.js";
import type { Model, ModelToType } from "./model.js";

export const Field = {
  string: variantConstructor<StringField>("StringField"),
  uuid: variantConstructor<UUIDField>("UUIDField"),
  integer: variantConstructor<IntegerField>("IntegerField"),
  float: variantConstructor<FloatField>("FloatField"),
  decimal: variantConstructor<DecimalField>("DecimalField"),
  reference: variantConstructor<ReferenceField>("ReferenceField"),
  posixDate: variantConstructor<PosixDateField>("PosixDateField"),
  boolean: variantConstructor<BooleanField>("BooleanField"),
  email: variantConstructor<EmailField>("EmailField"),
  url: variantConstructor<UrlField>("UrlField"),
  enum: <K extends string, TOpts extends Omit<EnumField<K>, VariantTag>>(
    opts: TOpts,
  ) => variantConstructor<EnumField<K>>("EnumField")(opts),
  embedded: <
    T extends Record<string, FieldDefinition>,
    TOpts extends EmbeddedField<T>,
  >(
    opts: Omit<TOpts, VariantTag>,
  ): TOpts => {
    return {
      [VariantTag]: "EmbeddedField",
      ...opts,
    } as const as TOpts;
  },
  objectArray: <
    T extends Record<string, FieldDefinition>,
    // eslint-disable-next-line @typescript-eslint/no-unnecessary-type-parameters
    TOpts extends Omit<ObjectArrayField<T>, VariantTag | "subModel">,
  >(
    subModel: T,
    opts?: TOpts,
  ) =>
    variantConstructor<ObjectArrayField<T>>("ObjectArrayField")({
      subModel,
      ...opts,
    }),
} as const satisfies Record<FieldShortName, any>;

export type FieldDefinition =
  | StringField
  | UUIDField
  | IntegerField
  | FloatField
  | DecimalField
  | ReferenceField
  | PosixDateField
  | EmbeddedField<any>
  | EmailField
  | BooleanField
  | EnumField<string>
  | UrlField
  | ObjectArrayField<any>;

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
  ObjectArrayField: "objectArray",
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
  : TField extends EmbeddedField<infer TSubModel> ? MaybeOptional<TField, ModelToType<Model<string, TSubModel>>>
  : TField extends ObjectArrayField<infer TSubModel> ? MaybeOptional<TField, ModelToType<Model<string, TSubModel>>[]>
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

export interface EmbeddedField<T extends Record<string, FieldDefinition>>
  extends TaggedVariant<"EmbeddedField">,
    BaseField {
  subModel: T;
}

export interface EnumField<TValues extends string>
  extends TaggedVariant<"EnumField">,
    BaseField {
  values: TValues[];
}

export interface UrlField extends TaggedVariant<"UrlField">, BaseField {}

export interface ObjectArrayField<T extends Record<string, FieldDefinition>>
  extends TaggedVariant<"ObjectArrayField">,
    BaseField {
  subModel: T;
}
