import { TaggedError } from "./error.js";

export type TagFromError<E extends TaggedError> = E["_tag"];

export function TagFromError<E extends TaggedError>(error: E): TagFromError<E> {
    return error["_tag"];
}
