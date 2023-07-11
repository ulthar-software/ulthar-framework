import { Fn } from "../functions/unary.js";
import { TaggedError } from "./tagged-error.js";

export function createNativeErrorWrapperWith<K extends string>(
    TaggedErrorConstructor: Fn<string | void | Error, TaggedError<K>>
) {
    return (err: unknown) => {
        return TaggedErrorConstructor(err as Error);
    };
}
