import { createDecimalField, DecimalField } from "./decimal.js";
import { createEmbeddedField, EmbeddedField } from "./embedded.js";
import { createFloatField, FloatField } from "./float.js";
import { createIntegerField, IntegerField } from "./integer.js";
import { createReferenceField, ReferenceField } from "./reference-field.js";
import { createStringField, StringField } from "./string-field.js";
import { createTimestampField, TimestampField } from "./timestamp.js";
import { createUUIDField, UUIDField } from "./uuid-field.js";
export * from "./base-field.js";
export * from "./field-to-type.js";
export * from "./reference-field.js";

export type FieldDefinition =
  | StringField
  | UUIDField
  | IntegerField
  | FloatField
  | DecimalField
  | ReferenceField
  | TimestampField
  | EmbeddedField;

export namespace Field {
  export const string = createStringField;
  export const uuid = createUUIDField;
  export const integer = createIntegerField;
  export const reference = createReferenceField;
  export const decimal = createDecimalField;
  export const float = createFloatField;
  export const timestamp = createTimestampField;
  export const embedded = createEmbeddedField;
}
