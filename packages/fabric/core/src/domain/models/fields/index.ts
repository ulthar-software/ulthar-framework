import { createStringField, StringField } from "./string-field.js";
import { createUUIDField, UUIDField } from "./uuid-field.js";
export * from "./base-field.js";

export type FieldDefinition = StringField | UUIDField;

export namespace Field {
  export const string = createStringField;
  export const uuid = createUUIDField;
}
