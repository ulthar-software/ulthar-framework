import { Variant } from "../variants/index.js";

export interface TaggedError<K extends string = string> extends Variant {
    readonly _tag: K;
    readonly nativeError?: Error | string;
}
