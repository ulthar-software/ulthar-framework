import { Error } from "./error.js";

export type TagFromError<E extends Error> = E["_tag"];

export function TagFromError<E extends Error>(error: E): TagFromError<E> {
    return error["_tag"];
}
