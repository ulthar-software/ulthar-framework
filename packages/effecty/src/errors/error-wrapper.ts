import { TaggedError } from "./tagged-error.js";

export type ErrorWrapper<TError extends TaggedError> = (
    error: unknown
) => TError;
