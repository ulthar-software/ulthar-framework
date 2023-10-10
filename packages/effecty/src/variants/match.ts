import { Fn } from "../utils/functions/function.js";
import { KeyOf } from "../utils/types/keyof.js";
import {
    DefaultVariant,
    PartialPatternMatcher,
    PatternMatcher,
} from "./pattern-matcher.js";
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
    TVariant extends TaggedVariant,
    TValue,
    PM extends PatternMatcher<TVariant, TValue>,
>(value: TVariant, cases: PM): TValue {
    let fn = cases[value._tag as KeyOf<PM>] as
        | Fn<[TVariant], TValue>
        | undefined;
    if (!fn) {
        fn = cases[DefaultVariant as unknown as KeyOf<PM>] as Fn<
            [TVariant],
            TValue
        >;
    }
    return fn(value);
}

/**
 * Match a variant value against a pattern matcher and return
 * the value of the matching function.
 */
export function partialMatch<
    TVariant extends TaggedVariant,
    TValue,
    PM extends PartialPatternMatcher<TVariant, TValue>,
>(value: TVariant, cases: PM): TValue | undefined {
    const fn = cases[value._tag as KeyOf<PM>] as
        | Fn<[TVariant], TValue>
        | undefined;
    if (fn !== undefined) {
        return fn(value);
    }
}
