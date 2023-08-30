import { TaggedError } from "./tagged-error.js";

export class UnexpectedError extends TaggedError<"UnexpectedError"> {
    constructor(error: Error | string) {
        super("UnexpectedError", error);
    }
}

export function wrapUnexpectedError(error: unknown) {
    return new UnexpectedError(error as Error | string);
}
