import { Variant } from "../types/variant.js";

export const ErrorTag = "_tag" as const;
export type ErrorTag = typeof ErrorTag;

export interface Error extends Variant {
    readonly [ErrorTag]: string;
    readonly message: string;
}
