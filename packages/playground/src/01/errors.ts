import { TaggedError } from "@ulthar/immuty";

export class ParameterIsNaNError extends TaggedError<"ParameterIsNaNError"> {
    constructor(readonly param: string) {
        super("ParameterIsNaNError");
    }
}

export class OperatorNotSupportedError extends TaggedError<"OperatorNotSupportedError"> {
    constructor(readonly op: string) {
        super("OperatorNotSupportedError");
    }
}

export class DivisionByZeroError extends TaggedError<"DivisionByZeroError"> {
    constructor(
        readonly a: number,
        readonly b: number
    ) {
        super("DivisionByZeroError");
    }
}
