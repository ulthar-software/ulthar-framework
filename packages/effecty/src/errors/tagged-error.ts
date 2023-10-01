import { TaggedVariant } from "../tagged-variant.js";

export class TaggedError<K extends string = string> implements TaggedVariant {
    readonly nativeError: Error;
    constructor(
        readonly _tag: K,
        nativeErrorOrMessage?: Error | string
    ) {
        if (!nativeErrorOrMessage) {
            this.nativeError = new Error();
            return;
        }

        if (typeof nativeErrorOrMessage == "string") {
            this.nativeError = new Error(nativeErrorOrMessage);
            return;
        }

        this.nativeError = nativeErrorOrMessage;
    }
}
