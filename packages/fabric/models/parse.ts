// deno-lint-ignore-file no-explicit-any
import { isRecordEmpty, Result, TaggedError } from "@fabric/core";
import { fieldParsers, FieldParsingError } from "./field-parsers.ts";
import { Model, ModelToType } from "./model.ts";

export function parse<T extends Model>(
  model: T,
  value: unknown,
): Result<ModelToType<T>, SchemaParsingError<T>> {
  const parsingErrors = {} as Record<keyof T["fields"], FieldParsingError>;
  const parsedValue = {} as ModelToType<T>;

  for (const key in model.fields) {
    const field = model.fields[key]!;
    const fieldResult = fieldParsers[field._tag](
      field as any,
      (value as any)[key],
    );

    if (fieldResult.isOk()) {
      parsedValue[key as keyof ModelToType<T>] = fieldResult.value;
    } else {
      parsingErrors[key as keyof ModelToType<T>] = fieldResult
        .unwrapErrorOrThrow();
    }
  }

  if (!isRecordEmpty(parsingErrors)) {
    return Result.failWith(
      new SchemaParsingError(parsingErrors, parsedValue),
    );
  } else {
    return Result.succeedWith(parsedValue);
  }
}

export class SchemaParsingError<TModel extends Model>
  extends TaggedError<"SchemaParsingFailed"> {
  constructor(
    public readonly errors: Record<keyof TModel["fields"], FieldParsingError>,
    public readonly value?: Partial<ModelToType<TModel>>,
  ) {
    super(
      "SchemaParsingFailed",
    );
  }
}
