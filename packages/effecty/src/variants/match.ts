import { Result } from "../results/result.js";
import { Fn } from "../utils/functions/function.js";
import { KeyOf } from "../utils/types/keyof.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";
import { PartialPatternMatcher, PatternMatcher } from "./pattern-matcher.js";
import { TaggedVariant } from "./tagged-variant.js";

/**
 * Match a variant value against a pattern matcher and return
 * the value of the matching function.
 *
 * @param value The variant value to match.
 * @param cases The pattern matcher to match against.
 * @returns The result of the matching function.
 */
export function fullMatch<
    A extends TaggedVariant,
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
    A extends TaggedVariant,
    B,
    MP extends MaybePromise<Result<B, never>>,
    PM extends PartialPatternMatcher<A, B, MP>,
>(value: A, cases: PM): MP | undefined {
    const fn = cases[value._tag as KeyOf<PM>] as Fn<[A], MP> | undefined;
    if (fn !== undefined) {
        return fn(value);
    }
}
