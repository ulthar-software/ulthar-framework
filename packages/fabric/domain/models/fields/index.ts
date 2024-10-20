import { type BooleanField, createBooleanField } from "./boolean-field.ts";
import { createDecimalField, type DecimalField } from "./decimal.ts";
import { createEmbeddedField, type EmbeddedField } from "./embedded.ts";
import { createFloatField, type FloatField } from "./float.ts";
import { createIntegerField, type IntegerField } from "./integer.ts";
import {
  createReferenceField,
  type ReferenceField,
} from "./reference-field.ts";
import { createStringField, type StringField } from "./string-field.ts";
import { createTimestampField, type TimestampField } from "./timestamp.ts";
import { createUUIDField, type UUIDField } from "./uuid-field.ts";
export * from "./base-field.ts";
export * from "./field-to-type.ts";
export * from "./reference-field.ts";
export * from "./uuid-field.ts";

export type FieldDefinition =
  | StringField
  | UUIDField
  | IntegerField
  | FloatField
  | DecimalField
  | ReferenceField
  | TimestampField
  | EmbeddedField
  | BooleanField;

export namespace Field {
  export const string = createStringField;
  export const uuid = createUUIDField;
  export const integer = createIntegerField;
  export const reference = createReferenceField;
  export const decimal = createDecimalField;
  export const float = createFloatField;
  export const timestamp = createTimestampField;
  export const embedded = createEmbeddedField;
  export const boolean = createBooleanField;
}
