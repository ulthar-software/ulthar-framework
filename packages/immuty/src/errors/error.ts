import { Variant } from "../types/variant.js";

export interface Error extends Variant {
    readonly _tag: string;
    readonly message: string;
}
