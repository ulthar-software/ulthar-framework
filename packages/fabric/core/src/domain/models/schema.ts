/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { TaggedError } from "../../error/tagged-error.js";
import { isRecordEmpty } from "../../record/is-record-empty.js";
import { Result } from "../../result/result.js";
import type { Keyof } from "../../types/keyof.js";
import { fieldParsers, type FieldParsingError } from "./field-parsers.js";
import type { FieldDefinition, FieldToType } from "./fields.js";

/**
 * A model is a schema definition for some type of structured data.
 */
export class Schema<TFields extends SchemaFields = any> {
  public constructor(readonly fields: TFields) {}

  parse(value: unknown): Result<Infer<this>, SchemaParsingError<this>> {
    const parsingErrors = {} as Record<keyof this["fields"], FieldParsingError>;
    const parsedValue = {} as Infer<this>;

    for (const key in this.fields) {
      const field = this.fields[key];
      const fieldParser = fieldParsers[field._tag] as any;
      const fieldResult = fieldParser(field as any, (value as any)[key]);

      if (fieldResult.isOk()) {
        (parsedValue as any)[key] = fieldResult.value;
      } else {
        parsingErrors[key] = fieldResult.unwrapErrorOrThrow();
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
}

export class SchemaParsingError<
  TModel extends Schema,
> extends TaggedError<"SchemaParsingFailed"> {
  constructor(
    public readonly errors: Record<keyof TModel["fields"], FieldParsingError>,
    public readonly value?: Partial<Infer<TModel>>,
  ) {
    super("SchemaParsingFailed");
  }
}

export type Infer<TSchema extends Schema> = SchemaToOptionalFields<TSchema> &
  SchemaToRequiredFields<TSchema>;

export type ModelFieldNames<TModel extends SchemaFields> = Keyof<
  TModel["fields"]
>;

type SchemaToOptionalFields<TSchema extends Schema> = {
  [K in OptionalFields<TSchema>]?: FieldToType<TSchema["fields"][K]>;
};

type SchemaToRequiredFields<TSchema extends Schema> = {
  [K in RequiredFields<TSchema>]: FieldToType<TSchema["fields"][K]>;
};

type OptionalFields<TSchema extends Schema> = {
  [K in Keyof<TSchema["fields"]>]: TSchema["fields"][K] extends {
    isOptional: true;
  }
    ? K
    : never;
}[Keyof<TSchema["fields"]>];

type RequiredFields<TSchema extends Schema> = {
  [K in Keyof<TSchema["fields"]>]: TSchema["fields"][K] extends {
    isOptional: true;
  }
    ? never
    : K;
}[Keyof<TSchema["fields"]>];

export type SchemaFields = Record<string, FieldDefinition>;
