import { Fn } from "../index.js";
import { PartialPatternMatcher, PatternMatcher } from "./pattern-matcher.js";
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
export function fullMatch<
    A extends Variant,
    B,
    PM extends PatternMatcher<A, B>,
>(value: A, cases: PM): B {
    if (!cases[value._tag as keyof PM]) {
        return cases["*" as keyof PM](value) as B;
    }
    return cases[value._tag as keyof PM](value) as B;
}

/**
 * Match a variant value against a pattern matcher and return
 * the value of the matching function.
 */

export function partialMatch<
    A extends Variant,
    B,
    PM extends PartialPatternMatcher<A, B>,
>(value: A, cases: PM): B | undefined {
    type EType = TypeFromTag<A, A["_tag"]>;
    const fn = cases[value._tag as keyof PM] as Fn<EType, B> | undefined;
    if (fn !== undefined) {
        return fn(value as EType);
    }
}
