import { Variant } from "./variant.js";

export function isVariant(value: unknown): value is Variant {
    return typeof value === "object" && value !== null && "_tag" in value;
}
