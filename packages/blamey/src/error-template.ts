import { Template } from "@ulthar/temply";
import { BlameyError } from "./blamey-error.js";
import { ErrorType } from "./error-type.js";

export class ErrorTemplate {
    private template: Template;

    constructor(
        template: string,
        private errorType: ErrorType = ErrorType.SYSTEM_ERROR
    ) {
        this.template = new Template(template);
    }

    render(name: string, context?: Record<string, any>): Error {
        const err = new BlameyError(
            name,
            this.template.render(context),
            this.errorType
        );
        return err;
    }
}
