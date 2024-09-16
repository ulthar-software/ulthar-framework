import { createStringField, StringField } from "./string-field.js";
import { createUUIDField } from "./uuid-field.js";

export type FieldDefinition = StringField;

export namespace Field {
  export const string = createStringField;
  export const uuid = createUUIDField;
}
