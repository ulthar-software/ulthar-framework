import { VariantTag } from "../variant/variant.js";
import { TaggedError } from "./tagged-error.js";

/**
 * Indicates if a value is an error.
 *
 * In case it is an error, the type of the error is able to be inferred.
 */
export function isError(err: unknown): err is TaggedError<string> {
  return (
    err instanceof Error &&
    VariantTag in err &&
    typeof err[VariantTag] === "string"
  );
}
