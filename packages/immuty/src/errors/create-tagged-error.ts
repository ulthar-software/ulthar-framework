import { Fn } from "../functions/index.js";
import { TaggedError } from "./tagged-error.js";

export function createTaggedError<K extends string>(
    tag: K
): Fn<Error | string | void, TaggedError<K>> {
    return (messageOrError) => ({
        _tag: tag,
        nativeError: messageOrError ?? undefined,
    });
}
