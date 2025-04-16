import { Decimal } from "../../decimal/decimal.js";
import { TaggedError } from "../../error/tagged-error.js";
import { Result } from "../../result/result.js";
import { PosixDate } from "../../time/posix-date.js";
import {
  isNullish,
  isUUID,
  parseAndSanitizeString,
} from "../../validations/index.js";
import { isEmail } from "../../validations/string/is-email.js";
import type { VariantFromTag } from "../../variant/variant.js";
import type { FieldDefinition, FieldToType } from "./fields.js";
import { Schema } from "./schema.js";

export type FieldParsers = {
  [K in FieldDefinition["_tag"]]: FieldParser<
    VariantFromTag<FieldDefinition, K>
  >;
};
export const fieldParsers: FieldParsers = {
  StringField: (f, v) => {
    return parseStringValue(f, v).flatMap((v) => parseStringSize(f, v));
  },
  UUIDField: (f, v) => {
    return parseStringValue(f, v).flatMap((parsedString) =>
      isUUID(parsedString)
        ? Result.ok(parsedString)
        : Result.failWith(new InvalidFieldTypeError()),
    );
  },
  ReferenceField: (f, v) => {
    return parseStringValue(f, v).flatMap((parsedString) =>
      isUUID(parsedString)
        ? Result.ok(parsedString)
        : Result.failWith(new InvalidFieldTypeError()),
    );
  },
  PosixDateField: (f, v) => {
    return parseOptionality(f, v, (v) => {
      if (v instanceof PosixDate) {
        return Result.ok(v);
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  BooleanField: (f, v) => {
    return parseOptionality(f, v, (v) => {
      if (typeof v === "boolean") {
        return Result.ok(v);
      }

      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  IntegerField: (f, v) => {
    return parseOptionality(f, v, (v) => {
      if (
        (typeof v === "number" && Number.isInteger(v)) ||
        typeof v === "bigint"
      ) {
        return Result.ok(v);
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  FloatField: (f, v) => {
    return parseOptionality(f, v, (v) => {
      if (typeof v === "number") {
        return Result.ok(v);
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  DecimalField: (f, v) => {
    return parseOptionality(f, v, (v) => {
      if (v instanceof Decimal) {
        return Result.ok(v);
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  EmbeddedField: function (f, v) {
    return parseOptionality(f, v, (v) => {
      if (typeof v === "object" && v !== null) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
        const result = parseSubModel(f.subModel, v);
        return result.errorMap(() => new InvalidFieldTypeError()) as Result<
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          any,
          InvalidFieldTypeError
        >;
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  EmailField: function (f, v) {
    return parseOptionality(f, v, (v) => {
      const parsedValue = parseAndSanitizeString(v);
      if (parsedValue === undefined || !isEmail(parsedValue)) {
        return Result.failWith(new InvalidFieldTypeError());
      }
      return Result.ok(parsedValue);
    });
  },
  EnumField: function (f, v) {
    return parseOptionality(f, v, (v) => {
      const parsedValue = parseAndSanitizeString(v);
      if (!parsedValue) return Result.failWith(new InvalidFieldTypeError());
      if (f.values.includes(parsedValue)) {
        return Result.ok(parsedValue);
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
  UrlField: function () {
    throw new Error("Function not implemented.");
  },
  ObjectArrayField: function (f, v) {
    return parseOptionality(f, v, (v) => {
      if (Array.isArray(v)) {
        const result = Result.fromArray(
          v.map((value) =>
            // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
            parseSubModel(f.subModel, value),
          ),
        );
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        return result as Result<any[], InvalidFieldTypeError>;
      }
      return Result.failWith(new InvalidFieldTypeError());
    });
  },
};

/**
 * A function that takes a field definition and a value and returns a result
 */
export type FieldParser<TField extends FieldDefinition> = (
  field: TField,
  value: unknown,
) => Result<FieldToType<TField> | undefined, FieldParsingError>;

/**
 * Field parsing errors
 */
export type FieldParsingError =
  | InvalidFieldTypeError
  | MissingRequiredFieldError;

/**
 * An error that occurs when a field is invalid
 */
export class InvalidFieldTypeError extends TaggedError<"InvalidField"> {
  constructor() {
    super("InvalidField");
  }
}

/**
 * An error that occurs when a required field is missing
 */
export class MissingRequiredFieldError extends TaggedError<"MissingRequiredField"> {
  constructor() {
    super("MissingRequiredField");
  }
}

function parseStringSize(
  field: { minLength?: number; maxLength?: number },
  value: string | undefined,
): Result<string | undefined, FieldParsingError> {
  if (field.minLength && !isNullish(value) && value.length < field.minLength) {
    return Result.failWith(new InvalidFieldTypeError());
  }
  if (field.maxLength && !isNullish(value) && value.length > field.maxLength) {
    return Result.failWith(new InvalidFieldTypeError());
  }
  return Result.ok(value);
}

/**
 * Parses a string value including optionality
 */
function parseStringValue(
  field: FieldDefinition,
  value: unknown,
): Result<string | undefined, FieldParsingError> {
  return parseOptionality(field, value, (v) => {
    const parsedValue = parseAndSanitizeString(v);
    if (parsedValue === undefined) {
      return Result.failWith(new InvalidFieldTypeError());
    }
    return Result.ok(parsedValue);
  });
}

/**
 * Parses the optionality of a field.
 * In other words, if a field is required and the value is undefined, it will return a MissingRequiredFieldError.
 * If the field is optional and the value is undefined, it will return the value as undefined.
 */
function parseOptionality<T>(
  field: FieldDefinition,
  value: unknown,
  withMapping?: (value: unknown) => Result<T, FieldParsingError>,
): Result<T | undefined, FieldParsingError> {
  if (!field.isOptional && value === undefined) {
    return Result.failWith(new MissingRequiredFieldError());
  }
  if (value === undefined) {
    return Result.ok(value);
  }
  if (!withMapping) {
    return Result.ok(value as T);
  }
  return withMapping(value);
}

function parseSubModel<T>(
  subModel: Record<string, FieldDefinition>,
  value: unknown,
): Result<T, InvalidFieldTypeError> {
  return new Schema(subModel)
    .parse(value)
    .errorMap(() => new InvalidFieldTypeError()) as Result<
    T,
    InvalidFieldTypeError
  >;
}
