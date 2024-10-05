import { UUID } from "../../types/uuid.js";
import { IntegerField } from "./integer.js";
import { ReferenceField } from "./reference-field.js";
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
        : TField["hasArbitraryPrecision"] extends false
          ? ToOptional<TField, number>
          : ToOptional<TField, number | bigint>
      : TField extends ReferenceField
        ? ToOptional<TField, UUID>
        : never;

type ToOptional<TField, TType> = TField extends { isOptional: true }
  ? TType | null
  : TType;
