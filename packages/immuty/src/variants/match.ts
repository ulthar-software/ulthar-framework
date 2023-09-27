import { Fn, KeyOf, MaybePromise, Result } from "../index.js";
import { PartialPatternMatcher, PatternMatcher } from "./pattern-matcher.js";
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
    PM extends PatternMatcher<A, B, MP>,
    MP extends MaybePromise<Result<B, never>>,
>(value: A, cases: PM): MP {
    let fn = cases[value._tag as KeyOf<PM>] as Fn<[A], MP> | undefined;
    if (!fn) {
        fn = cases["*" as KeyOf<PM>] as Fn<[A], MP>;
    }
    return fn(value);
}

/**
 * Match a variant value against a pattern matcher and return
 * the value of the matching function.
 */
export function partialMatch<
    A extends Variant,
    B,
    MP extends MaybePromise<Result<B, never>>,
    PM extends PartialPatternMatcher<A, B, MP>,
>(value: A, cases: PM): MP | undefined {
    const fn = cases[value._tag as KeyOf<PM>] as Fn<[A], MP> | undefined;
    if (fn !== undefined) {
        return fn(value);
    }
}
