import { TaggedError } from "../../error/tagged-error.js";
import { Result } from "../../result/result.js";
import type { ReferenceField } from "./fields.js";
import type { ModelSchema } from "./model.js";

export function getTargetKey(field: ReferenceField): string {
  return field.targetKey ?? "id";
}

export function validateReferenceField(
  schema: ModelSchema,
  field: ReferenceField,
): Result<void, InvalidReferenceFieldError> {
  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (!schema[field.targetModel]) {
    return Result.failWith(
      new InvalidReferenceFieldError(
        `The target model '${field.targetModel}' is not in the schema.`,
      ),
    );
  }

  // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
  if (field.targetKey && !schema[field.targetModel].fields[field.targetKey]) {
    return Result.failWith(
      new InvalidReferenceFieldError(
        `The target key '${field.targetKey}' is not in the target model '${field.targetModel}'.`,
      ),
    );
  }

  if (
    field.targetKey &&
    !schema[field.targetModel].fields[field.targetKey].isUnique
  ) {
    return Result.failWith(
      new InvalidReferenceFieldError(
        `The target key '${field.targetModel}'.'${field.targetKey}' is not unique.`,
      ),
    );
  }

  return Result.ok();
}

export class InvalidReferenceFieldError extends TaggedError<"InvalidReferenceField"> {
  constructor(readonly reason: string) {
    super("InvalidReferenceField");
  }
}
