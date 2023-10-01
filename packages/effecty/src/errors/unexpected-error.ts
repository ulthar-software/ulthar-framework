import { TaggedError } from "./tagged-error.js";

export class UnexpectedTaggedError extends TaggedError<"UnexpectedError"> {
    constructor(error: Error | string) {
        super("UnexpectedError", error);
    }
}

export function wrapUnexpectedError(error: unknown) {
    return new UnexpectedTaggedError(error as Error | string);
}
