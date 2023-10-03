import { TaggedVariant } from "../variants/tagged-variant.js";

/**
 * Represents an Error with a Tag that can be used to pattern match it.
 */
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

    toString(params?: Record<string, unknown>) {
        return `[${this._tag}]${params ? " " + JSON.stringify(params) : ""} ${
            this.nativeError.stack
        }`;
    }
}
