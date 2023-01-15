import { BlameyError } from "./blamey-error.js";
import { ErrorTemplate } from "./error-template.js";

export class ErrorContainer<ErrorMap extends Record<string, ErrorTemplate>> {
    constructor(private map: ErrorMap) {}

    assert<ErrorKey extends keyof ErrorMap>(
        value: any,
        errorKey: ErrorKey,
        context?: Record<string, unknown>
    ) {
        if (!value) {
            this.throw(errorKey, context);
        }
    }

    throw<ErrorKey extends keyof ErrorMap>(
        errorKey: ErrorKey,
        context?: Record<string, unknown>
    ) {
        throw this.map[errorKey].render(<string>errorKey, context);
    }

    is<ErrorKey extends keyof ErrorMap>(
        err: BlameyError,
        errorKey: ErrorKey
    ): boolean {
        return err.name == errorKey;
    }

    render<ErrorKey extends keyof ErrorMap>(
        errorKey: ErrorKey,
        context?: Record<string, unknown>
    ) {
        return this.map[errorKey].render(<string>errorKey, context);
    }
}
