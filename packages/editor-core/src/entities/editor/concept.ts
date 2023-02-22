import { Maybe } from "@ulthar/typey";
import { Type } from "./types/type.js";

export class Concept {
    type: Maybe<Type>;

    get isConcrete(): boolean {
        return !!this.type;
    }
}
