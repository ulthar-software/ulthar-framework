import { TaggedError } from "./tagged-error.js";

export function isTaggedError(value: unknown): value is TaggedError {
    return (
        typeof value === "object" &&
        value !== null &&
        "_tag" in value &&
        "nativeError" in value
    );
}
