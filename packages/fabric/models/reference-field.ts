import { Result, TaggedError } from "@fabric/core";
import type { ReferenceField } from "./fields.ts";
import { ModelSchema } from "./model.ts";

export function getTargetKey(field: ReferenceField): string {
  return field.targetKey || "id";
}

export function validateReferenceField(
  schema: ModelSchema,
  field: ReferenceField,
): Result<void, InvalidReferenceFieldError> {
  if (!schema[field.targetModel]) {
    return Result.failWith(
      new InvalidReferenceFieldError(
        `The target model '${field.targetModel}' is not in the schema.`,
      ),
    );
  }

  if (field.targetKey && !schema[field.targetModel]!.fields[field.targetKey]) {
    return Result.failWith(
      new InvalidReferenceFieldError(
        `The target key '${field.targetKey}' is not in the target model '${field.targetModel}'.`,
      ),
    );
  }

  if (
    field.targetKey &&
    !schema[field.targetModel]!.fields[field.targetKey]!.isUnique
  ) {
    return Result.failWith(
      new InvalidReferenceFieldError(
        `The target key '${field.targetModel}'.'${field.targetKey}' is not unique.`,
      ),
    );
  }

  return Result.ok();
}

export class InvalidReferenceFieldError
  extends TaggedError<"InvalidReferenceField"> {
  constructor(readonly reason: string) {
    super("InvalidReferenceField");
  }
}
