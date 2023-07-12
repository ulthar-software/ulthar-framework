import { TaggedErrorConstructor } from "./create-tagged-error.js";
import { TaggedError } from "./tagged-error.js";

export interface ErrorWrapper<E extends TaggedError> {
    (err: unknown): E;
}

export function createNativeErrorWrapperWith<K extends string>(
    ctr: TaggedErrorConstructor<TaggedError<K>>
): ErrorWrapper<TaggedError<K>> {
    return (err: unknown) => {
        return ctr(err as any);
    };
}
