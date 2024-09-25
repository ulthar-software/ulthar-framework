import { Result, TaggedError, TaggedVariant, VariantTag } from "@fabric/core";
import { ModelSchema } from "../model-schema.js";
import { BaseField } from "./base-field.js";

export interface ReferenceFieldOptions extends BaseField {
  model: string;
  targetKey?: string;
}

export interface ReferenceField
  extends TaggedVariant<"ReferenceField">,
    ReferenceFieldOptions {}

export function createReferenceField<T extends ReferenceFieldOptions>(
  opts: T = {} as T,
): ReferenceField & T {
  return {
    [VariantTag]: "ReferenceField",
    ...opts,
  } as const;
}

export function validateReferenceField(
  schema: ModelSchema,
  modelName: string,
  fieldName: string,
  field: ReferenceField,
): Result<void, InvalidReferenceField> {
  if (!schema[field.model]) {
    return new InvalidReferenceField(
      modelName,
      fieldName,
      `The target model '${field.model}' is not in the schema.`,
    );
  }

  if (field.targetKey && !schema[field.model][field.targetKey]) {
    return new InvalidReferenceField(
      modelName,
      fieldName,
      `The target key '${field.targetKey}' is not in the target model '${field.model}'.`,
    );
  }

  if (field.targetKey && !schema[field.model][field.targetKey].isUnique) {
    return new InvalidReferenceField(
      modelName,
      fieldName,
      `The target key '${field.model}'.'${field.targetKey}' is not unique.`,
    );
  }
}

export class InvalidReferenceField extends TaggedError<"InvalidReferenceField"> {
  constructor(
    readonly modelName: string,
    readonly fieldName: string,
    readonly reason: string,
  ) {
    super("InvalidReferenceField");
  }

  toString() {
    return `InvalidReferenceField: ${this.modelName}.${this.fieldName}. ${this.reason}`;
  }
}
