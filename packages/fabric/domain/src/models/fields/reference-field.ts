import { Result, TaggedError, TaggedVariant, VariantTag } from "@fabric/core";
import { ModelSchema } from "../model-schema.js";
import { BaseField } from "./base-field.js";

export interface ReferenceFieldOptions extends BaseField {
  targetModel: string;
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

export function getTargetKey(field: ReferenceField): string {
  return field.targetKey || "id";
}

export function validateReferenceField(
  schema: ModelSchema,
  field: ReferenceField,
): Result<void, InvalidReferenceField> {
  if (!schema[field.targetModel]) {
    return new InvalidReferenceField(
      `The target model '${field.targetModel}' is not in the schema.`,
    );
  }

  if (field.targetKey && !schema[field.targetModel].fields[field.targetKey]) {
    return new InvalidReferenceField(
      `The target key '${field.targetKey}' is not in the target model '${field.targetModel}'.`,
    );
  }

  if (
    field.targetKey &&
    !schema[field.targetModel].fields[field.targetKey].isUnique
  ) {
    return new InvalidReferenceField(
      `The target key '${field.targetModel}'.'${field.targetKey}' is not unique.`,
    );
  }
}

export class InvalidReferenceField extends TaggedError<"InvalidReferenceField"> {
  constructor(readonly reason: string) {
    super("InvalidReferenceField");
  }
}
