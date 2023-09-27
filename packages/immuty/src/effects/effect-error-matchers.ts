import {
    ErrorFromTag,
    KeyOf,
    MaybePromise,
    PartialPatternMatcher,
    PatternMatcher,
    RemainingUnmatchedErrors,
    Result,
    TaggedError,
    UnexpectedTaggedError,
    fullMatch,
    partialMatch,
} from "../index.js";

export type DefaultEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A,
> = {
    "*": (e: [AErr, ADeps]) => MaybePromise<Result<A, never>>;
};

export type FullEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A,
> = {
    [K in AErr["_tag"]]: (
        e: ErrorFromTag<AErr, K>,
        deps: ADeps
    ) => MaybePromise<Result<A, never>>;
} & {
    UnexpectedError?: (
        e: UnexpectedTaggedError,
        deps: ADeps
    ) => MaybePromise<Result<A, never>>;
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
        return result as unknown as Result<
            A,
            RemainingUnmatchedErrors<AErr, PM>
        >;
    }
    const resultMatcher: PartialPatternMatcher<
        AErr,
        A,
        MaybePromise<Result<A, never>>
    > = {};

    for (const key in matcher) {
        const fn = matcher[key];

        if (!fn) {
            throw new Error(
                `EffectErrorPartialMatch: matcher key '${key}' is defined but has no handler.`
            );
        }

        resultMatcher[key] = (e) => {
            return fn(e as unknown as ErrorFromTag<AErr, KeyOf<PM>>, deps);
        };
    }
    const v = await partialMatch(result.unwrapError(), resultMatcher);

    if (!v) {
        return result as Result<A, RemainingUnmatchedErrors<AErr, PM>>;
    }
    return v as Result<A, RemainingUnmatchedErrors<AErr, PM>>;
}

export async function effectErrorFullMatch<
    ADeps,
    AErr extends TaggedError,
    A,
    PM extends EffectErrorPatternMatcher<ADeps, AErr, A>,
>(
    deps: ADeps,
    result: Result<A, AErr>,
    matcher: PM
): Promise<Result<A, never>> {
    if (result.isOk()) {
        return result as unknown as Result<A, never>;
    }
    const resultMatcher = {} as PatternMatcher<
        AErr,
        A,
        MaybePromise<Result<A, never>>
    >;

    for (const key in matcher) {
        const fn = matcher[key] as (
            e: TaggedError,
            deps: ADeps
        ) => MaybePromise<Result<A, never>>;

        resultMatcher[key as KeyOf<typeof resultMatcher>] = (
            e: TaggedError
        ) => {
            return fn(e, deps);
        };
    }
    const v = await fullMatch(result.unwrapError(), resultMatcher);
    return v as Result<A, never>;
}
