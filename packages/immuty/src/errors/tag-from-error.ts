import { Error, ErrorTag } from "./error.js";

export type TagFromError<E extends Error> = E[ErrorTag];

export function TagFromError<E extends Error>(error: E): TagFromError<E> {
    return error[ErrorTag];
}
