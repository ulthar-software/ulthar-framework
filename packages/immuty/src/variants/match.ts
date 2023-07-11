import { ReturnTypesOfMethodsInObject } from "../types/return-types.js";
import { PatternMatcher } from "./pattern-matcher.js";
import { TypeFromTag } from "./type-from-tag.js";
import { Variant } from "./variant.js";

/**
 * Match a variant value against a pattern matcher and return
 * the value of the matching function.
 *
 * @param value The variant value to match.
 * @param cases The pattern matcher to match against.
 * @returns The result of the matching function.
 */
export function match<A extends Variant, PM extends PatternMatcher<A, any>>(
    value: A,
    cases: PM
): ReturnTypesOfMethodsInObject<PM> {
    return cases[value._tag as A["_tag"]](value as TypeFromTag<A, A["_tag"]>);
}
