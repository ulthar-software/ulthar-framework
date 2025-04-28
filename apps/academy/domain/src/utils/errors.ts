import type { TaggedError, TypeOfClass } from "@fabric/core";
import { JSONExt, VariantTag } from "@fabric/core";
import type { DomainUseCaseErrors } from "../use-cases.js";
import { DomainUseCaseErrorsMap } from "../use-cases.js";

export function serializeError<TName extends string>(
  error: TaggedError<TName>,
): string {
  return JSONExt.stringify(error).unwrapOrThrow();
}

export function deserializeError<TName extends DomainUseCaseErrors[VariantTag]>(
  serializedError: { [VariantTag]: TName } & Record<string, unknown>,
): TypeOfClass<DomainUseCaseErrorsMap[TName]> {
  //@ts-expect-error we don't care about the constructor parameters here
  const error = new DomainUseCaseErrorsMap[serializedError[VariantTag]]();
  Object.assign(error, serializedError);
  return error as TypeOfClass<DomainUseCaseErrorsMap[TName]>;
}
