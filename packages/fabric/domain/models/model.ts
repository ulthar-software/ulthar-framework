// deno-lint-ignore-file no-explicit-any
import { isRecordEmpty, type Keyof, Result, TaggedError } from "@fabric/core";
import { fieldParsers, type FieldParsingError } from "./field-parsers.ts";
import { Field, type FieldDefinition, type FieldToType } from "./fields.ts";

/**
 * A model is a schema definition for some type of structured data.
 */
export class Model<
  TName extends string = string,
  TFields extends ModelFields = ModelFields,
> {
  static from<TName extends string, TFields extends ModelFields>(
    name: TName,
    fields: TFields,
  ) {
    return new Model(name, fields);
  }

  static aggregateFrom<TName extends string, TFields extends ModelFields>(
    name: TName,
    fields: TFields,
  ): Model<TName, TFields & typeof DefaultAggregateFields> {
    return new Model(name, { ...fields, ...DefaultAggregateFields });
  }

  static entityFrom<TName extends string, TFields extends ModelFields>(
    name: TName,
    fields: TFields,
  ): Model<TName, TFields & typeof DefaultEntityFields> {
    return new Model(name, { ...fields, ...DefaultEntityFields });
  }
  private constructor(readonly name: TName, readonly fields: TFields) {}

  public parse(
    value: unknown,
  ): Result<ModelToType<this>, SchemaParsingError<this>> {
    const parsingErrors = {} as Record<keyof this["fields"], FieldParsingError>;
    const parsedValue = {} as ModelToType<this>;

    for (const key in this.fields) {
      const field = this.fields[key]!;
      const fieldResult = fieldParsers[field._tag](
        field as any,
        (value as any)[key],
      );

      if (fieldResult.isOk()) {
        parsedValue[key as keyof ModelToType<this>] = fieldResult.value;
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

export type EntityModel = Model<
  string,
  typeof DefaultEntityFields & ModelFields
>;

export type AggregateModel = Model<
  string,
  typeof DefaultAggregateFields & ModelFields
>;

export type ModelToType<TModel extends Model> =
  & ModelToOptionalFields<TModel>
  & ModelToRequiredFields<TModel>;

export type ModelFieldNames<TModel extends ModelFields> = Keyof<
  TModel["fields"]
>;

export type ModelAddressableFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends { isUnique: true }
    ? K
    : never;
}[Keyof<TModel["fields"]>];

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

type ModelFields = Record<string, FieldDefinition>;

const DefaultEntityFields = {
  id: Field.uuid({ isPrimaryKey: true }),
} as const;

const DefaultAggregateFields = {
  ...DefaultEntityFields,
  streamId: Field.uuid({ isIndexed: true }),
  streamVersion: Field.integer({
    isUnsigned: true,
    hasArbitraryPrecision: true,
  }),
  deletedAt: Field.posixDate({ isOptional: true }),
} as const;

type ModelToOptionalFields<TModel extends Model> = {
  [K in OptionalFields<TModel>]?: FieldToType<
    TModel["fields"][K]
  >;
};

type ModelToRequiredFields<TModel extends Model> = {
  [K in RequiredFields<TModel>]: FieldToType<
    TModel["fields"][K]
  >;
};

type OptionalFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends {
    isOptional: true;
  } ? K
    : never;
}[Keyof<TModel["fields"]>];

type RequiredFields<TModel extends Model> = {
  [K in Keyof<TModel["fields"]>]: TModel["fields"][K] extends {
    isOptional: true;
  } ? never
    : K;
}[Keyof<TModel["fields"]>];
