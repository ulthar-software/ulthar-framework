import type { PosixDate } from "@fabric/core";
import type Decimal from "jsr:@quentinadam/decimal";
import type { UUID } from "../../types/uuid.ts";
import type { DecimalField } from "./decimal.ts";
import type { EmbeddedField } from "./embedded.ts";
import type { FloatField } from "./float.ts";
import type { IntegerField } from "./integer.ts";
import type { ReferenceField } from "./reference-field.ts";
import type { StringField } from "./string-field.ts";
import type { TimestampField } from "./timestamp.ts";
import type { UUIDField } from "./uuid-field.ts";

/**
 * Converts a field definition to its corresponding TypeScript type.
 */
//prettier-ignore
export type FieldToType<TField> = TField extends StringField
  ? MaybeOptional<TField, string>
  : TField extends UUIDField ? MaybeOptional<TField, UUID>
  : TField extends IntegerField ? IntegerFieldToType<TField>
  : TField extends ReferenceField ? MaybeOptional<TField, UUID>
  : TField extends DecimalField ? MaybeOptional<TField, Decimal>
  : TField extends FloatField ? MaybeOptional<TField, number>
  : TField extends TimestampField ? MaybeOptional<TField, PosixDate>
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
  ? TType | null
  : TType;
