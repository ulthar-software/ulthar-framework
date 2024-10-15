import { PosixDate } from "@fabric/core";
import { Decimal } from "decimal.js";
import { UUID } from "../../types/uuid.js";
import { DecimalField } from "./decimal.js";
import { EmbeddedField } from "./embedded.js";
import { FloatField } from "./float.js";
import { IntegerField } from "./integer.js";
import { ReferenceField } from "./reference-field.js";
import { StringField } from "./string-field.js";
import { TimestampField } from "./timestamp.js";
import { UUIDField } from "./uuid-field.js";

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
  : TField extends TimestampField ? MaybeOptional<TField, PosixDate>
  : TField extends EmbeddedField<infer TSubModel> ? MaybeOptional<TField, TSubModel>
  : never;

//prettier-ignore
type IntegerFieldToType<TField extends IntegerField> = TField["hasArbitraryPrecision"] extends true
  ? MaybeOptional<TField, bigint>
  : TField["hasArbitraryPrecision"] extends false
  ? MaybeOptional<TField, number>
  : MaybeOptional<TField, number | bigint>;

type MaybeOptional<TField, TType> = TField extends { isOptional: true }
  ? TType | null
  : TType;
