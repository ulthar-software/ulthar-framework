import {
  PosixDate,
  Result,
  TaggedError,
  type VariantFromTag,
} from "@fabric/core";
import { isUUID, parseAndSanitizeString } from "@fabric/validations";
import type { FieldDefinition, FieldToType } from "../models/index.ts";

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
  TimestampField: (f, v) => {
    return parseOptionality(f, v).flatMap((parsedValue) => {
      if (parsedValue === undefined) return Result.ok(undefined);

      if (!(v instanceof PosixDate)) {
        return Result.failWith(new InvalidFieldTypeError());
      }

      return Result.ok(v);
    });
  },
  BooleanField: (f, v) => {
    if (!f.isOptional && v === undefined) {
      return Result.failWith(new MissingRequiredFieldError());
    }
    if (v === undefined) {
      return Result.ok(undefined);
    }

    if (typeof v === "boolean") {
      return Result.ok(v);
    }

    return Result.failWith(new InvalidFieldTypeError());
  },
  IntegerField: function (): Result<
    number | bigint | undefined,
    FieldParsingError
  > {
    throw new Error("Function not implemented.");
  },
  FloatField: function () {
    throw new Error("Function not implemented.");
  },
  DecimalField: function () {
    throw new Error("Function not implemented.");
  },
  EmbeddedField: function () {
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
  value: T | undefined,
): Result<T | undefined, FieldParsingError> {
  if (!field.isOptional && value === undefined) {
    return Result.failWith(new MissingRequiredFieldError());
  }
  return Result.ok(value);
}
