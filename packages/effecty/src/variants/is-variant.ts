import { TaggedVariant } from "./tagged-variant.js";

export function isVariant(value: unknown): value is TaggedVariant {
    return typeof value === "object" && value !== null && "_tag" in value;
}
