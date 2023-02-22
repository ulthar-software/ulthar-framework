import { Type } from "./type.js";

export class GenericType extends Type {
    constructor(name: string, public genericTypeNames: string[]) {
        super(name);
    }
}
