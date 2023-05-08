import { ErrorType } from "./error-type.js";

export class BlameyError extends Error {
    public get type(): ErrorType {
        return this.errorType;
    }
    constructor(name: string, message: string, private errorType: ErrorType) {
        super(message);
        this.name = name;
    }
}
