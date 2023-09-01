import {
    ErrorFromTag,
    Fn,
    OkResult,
    PartialPatternMatcher,
    PatternMatcher,
    RemainingUnmatchedErrors,
    Result,
    TaggedError,
    fullMatch,
    partialMatch,
} from "../index.js";
import { Maybe } from "../types/maybe.js";

export type DefaultEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A,
> = {
    "*": (e: [AErr, ADeps]) => Promise<A>;
};

export type FullEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A,
> = {
    [K in AErr["_tag"]]: (e: ErrorFromTag<AErr, K>, deps: ADeps) => Promise<A>;
};

export type PartialEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A,
> = Partial<FullEffectErrorPatternMatcher<ADeps, AErr, A>>;

export type EffectErrorPatternMatcher<ADeps, AErr extends TaggedError, A> =
    | FullEffectErrorPatternMatcher<ADeps, AErr, A>
    | (PartialEffectErrorPatternMatcher<ADeps, AErr, A> &
          DefaultEffectErrorPatternMatcher<ADeps, AErr, A>)
    | DefaultEffectErrorPatternMatcher<ADeps, AErr, A>;

/**
 * A partial Pattern Matcher for errors.
 */
export async function effectErrorPartialMatch<
    ADeps,
    AErr extends TaggedError,
    A,
    PM extends PartialEffectErrorPatternMatcher<ADeps, AErr, A>,
>(
    deps: ADeps,
    result: Result<A, AErr>,
    matcher: PM
): Promise<Result<A, RemainingUnmatchedErrors<AErr, PM>>> {
    if (result.isOk()) {
        return result as Result<A, RemainingUnmatchedErrors<AErr, PM>>;
    }
    const resultMatcher: PartialPatternMatcher<AErr, Promise<A>> = {};
    for (const key in matcher) {
        if (!matcher[key as keyof PM]) {
            throw new Error(
                `EffectErrorPartialMatch: matcher key '${key}' is defined but has no handler.`
            );
        }

        type EType = ErrorFromTag<AErr, AErr["_tag"]>;
        resultMatcher[key] = (e: TaggedError) => {
            const fn = matcher[key as keyof PM] as Fn<
                [EType, ADeps],
                Promise<A>
            >; //we know it's defined because of the loop
            return fn(e as EType, deps);
        };
    }
    const v = partialMatch(result.unwrapError(), resultMatcher) as Maybe<
        Promise<A>
    >;

    if (!v) {
        return result as Result<A, RemainingUnmatchedErrors<AErr, PM>>;
    }
    return Result.ok(await v) as Result<A, RemainingUnmatchedErrors<AErr, PM>>;
}

export async function effectErrorFullMatch<
    ADeps,
    AErr extends TaggedError,
    A,
    PM extends EffectErrorPatternMatcher<ADeps, AErr, A>,
>(deps: ADeps, result: Result<A, AErr>, matcher: PM): Promise<OkResult<A>> {
    if (result.isOk()) {
        return result;
    }
    const resultMatcher = {} as PatternMatcher<AErr, Promise<A>>;
    for (const key in matcher) {
        resultMatcher[key as keyof PatternMatcher<AErr, Promise<A>>] = (
            e: TaggedError
        ) => {
            const fn = matcher[key as keyof PM];
            return fn([e, deps]) as Promise<A>;
        };
    }
    const v = fullMatch(result.unwrapError(), resultMatcher);
    return Result.ok(await v) as OkResult<A>;
}
