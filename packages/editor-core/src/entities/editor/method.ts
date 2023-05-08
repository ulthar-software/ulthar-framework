import { DefaultTypes } from "./types/default-types.js";
import { Type } from "./types/type.js";

export interface Parameter {
    name: string;
    type: Type;
}

export class Method {
    constructor(public name: string) {}

    parameters: Parameter[] = [];
    returnType: Type = DefaultTypes.void;
}
