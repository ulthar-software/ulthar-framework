import { UUID } from "../../types/uuid.js";
import { StringField } from "./string-field.js";
import { UUIDField } from "./uuid-field.js";

export type FieldToType<TField> = TField extends StringField
  ? string
  : TField extends UUIDField
    ? UUID
    : never;
