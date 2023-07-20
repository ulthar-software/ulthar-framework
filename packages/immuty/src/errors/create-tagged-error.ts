import { Fn } from "../functions/index.js";
import { TaggedError } from "./tagged-error.js";

export type TaggedErrorConstructor<E extends TaggedError> = Fn<
    Error | string | void,
    E
>;

export function createTaggedError<K extends string>(
    tag: K
): TaggedErrorConstructor<TaggedError<K>> {
    return (messageOrError) => {
        if (messageOrError instanceof Error) {
            return {
                _tag: tag,
                nativeError: messageOrError,
            };
        }
        if (typeof messageOrError === "string") {
            return {
                _tag: tag,
                nativeError: new Error(messageOrError),
            };
        }
        return {
            _tag: tag,
            nativeError: new Error(),
        };
    };
}
