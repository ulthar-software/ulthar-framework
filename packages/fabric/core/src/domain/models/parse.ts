/* eslint-disable @typescript-eslint/no-unsafe-argument */

/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */

import { TaggedError } from "../../error/tagged-error.js";
import { isRecordEmpty } from "../../record/is-record-empty.js";
import { Result } from "../../result/result.js";
import { fieldParsers, type FieldParsingError } from "./field-parsers.js";
import type { FieldDefinition } from "./fields.js";
import type { Model, ModelToType } from "./model.js";

export function parseModel<T extends Model>(
  model: T,
  value: unknown,
): Result<ModelToType<T>, SchemaParsingError<T>> {
  const parsingErrors = {} as Record<keyof T["fields"], FieldParsingError>;
  const parsedValue = {} as ModelToType<T>;

  for (const key in model.fields) {
    const field = model.fields[key] as FieldDefinition;
    const fieldResult = fieldParsers[field._tag](
      field as any,
      (value as any)[key],
    );

    if (fieldResult.isOk()) {
      parsedValue[key as keyof ModelToType<T>] =
        fieldResult.value as ModelToType<T>[keyof ModelToType<T>];
    } else {
      parsingErrors[key as keyof ModelToType<T>] =
        fieldResult.unwrapErrorOrThrow();
    }
  }

  if (!isRecordEmpty(parsingErrors)) {
    return Result.failWith(new SchemaParsingError(parsingErrors, parsedValue));
  } else {
    return Result.succeedWith(parsedValue);
  }
}

export class SchemaParsingError<
  TModel extends Model,
> extends TaggedError<"SchemaParsingFailed"> {
  constructor(
    public readonly errors: Record<keyof TModel["fields"], FieldParsingError>,
    public readonly value?: Partial<ModelToType<TModel>>,
  ) {
    super("SchemaParsingFailed");
  }
}
