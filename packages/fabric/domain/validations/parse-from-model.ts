// deno-lint-ignore-file no-explicit-any

import { isRecordEmpty, Result, TaggedError } from "@fabric/core";
import type { FieldDefinition, Model, ModelToType } from "../models/index.ts";
import { fieldParsers, type FieldParsingError } from "./field-parsers.ts";

export function parseFromModel<
  TModel extends Model,
>(
  model: TModel,
  value: unknown,
): Result<ModelToType<TModel>, SchemaParsingError<TModel>> {
  const parsingErrors = {} as Record<keyof TModel, FieldParsingError>;
  const parsedValue = {} as ModelToType<TModel>;

  for (const key in model) {
    const field = model[key] as FieldDefinition;
    const fieldResult = fieldParsers[field._tag](field as any, value);

    if (fieldResult.isOk()) {
      parsedValue[key as keyof ModelToType<TModel>] = fieldResult
        .value();
    } else {
      parsingErrors[key] = fieldResult.unwrapErrorOrThrow();
    }
  }

  if (!isRecordEmpty(parsingErrors)) {
    return Result.failWith(new SchemaParsingError(parsingErrors, parsedValue));
  } else {
    return Result.succeedWith(parsedValue);
  }
}

export class SchemaParsingError<TModel extends Model>
  extends TaggedError<"SchemaParsingFailed"> {
  constructor(
    public readonly errors: Record<keyof TModel, FieldParsingError>,
    public readonly value?: Partial<ModelToType<TModel>>,
  ) {
    super("SchemaParsingFailed");
  }
}
