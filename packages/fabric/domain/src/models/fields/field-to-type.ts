import { UUID } from "../../types/uuid.js";
import { IntegerField } from "./integer.js";
import { StringField } from "./string-field.js";
import { UUIDField } from "./uuid-field.js";

/**
 * Converts a field definition to its corresponding TypeScript type.
 */
export type FieldToType<TField> = TField extends StringField
  ? ToOptional<TField, string>
  : TField extends UUIDField
    ? ToOptional<TField, UUID>
    : TField extends IntegerField
      ? TField["hasArbitraryPrecision"] extends true
        ? ToOptional<TField, bigint>
        : ToOptional<TField, number>
      : never;

type ToOptional<TField, TType> = TField extends { isOptional: true }
  ? TType | null
  : TType;
