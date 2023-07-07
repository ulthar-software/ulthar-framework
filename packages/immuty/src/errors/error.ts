import { Fn } from "../functions/unary.js";
import { Maybe } from "../types/maybe.js";
import { Variant } from "../types/variant.js";

export interface TaggedError<K extends string = any> extends Variant {
    readonly _tag: K;
    readonly message?: string;
}

export function createTaggedError<K extends string>(
    tag: K
): Fn<string | void, TaggedError<K>> {
    return (message) => ({
        _tag: tag,
        message: message ?? undefined,
    });
}
