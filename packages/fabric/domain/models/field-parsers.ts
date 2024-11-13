import {
  Decimal,
  PosixDate,
  Result,
  TaggedError,
  type VariantFromTag,
} from "@fabric/core";
import { isUUID, parseAndSanitizeString } from "@fabric/validations";
import { FieldDefinition, FieldToType } from "./fields.ts";

export type FieldParsers = {
  [K in FieldDefinition["_tag"]]: FieldParser<
    VariantFromTag<FieldDefinition, K>
  >;
};
export const fieldParsers: FieldParsers = {
  StringField: (f, v) => {
    return parseStringValue(f, v);
  },
  UUIDField: (f, v) => {
    return parseStringValue(f, v)
      .flatMap((parsedString) =>
        isUUID(parsedString)
          ? Result.ok(parsedString)
          : Result.failWith(new InvalidFieldTypeError())
      );
  },
  ReferenceField: (f, v) => {
    return parseStringValue(f, v)
      .flatMap((parsedString) =>
        isUUID(parsedString)
          ? Result.ok(parsedString)
          : Result.failWith(new InvalidFieldTypeError())
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
        (typeof v === "number" &&
          Number.isInteger(v)) || (typeof v === "bigint")
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
  EmbeddedField: function () {
    throw new Error("Function not implemented.");
  },
  EmailField: function () {
    throw new Error("Function not implemented.");
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
export class MissingRequiredFieldError extends TaggedError<"RequiredField"> {
  constructor() {
    super("RequiredField");
  }
}

/**
 * Parses a string value including optionality
 */
function parseStringValue(
  field: FieldDefinition,
  value: unknown,
): Result<string | undefined, FieldParsingError> {
  const parsedValue = parseAndSanitizeString(value);
  return parseOptionality(field, parsedValue);
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
