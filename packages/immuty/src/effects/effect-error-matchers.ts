import {
    ErrorFromTag,
    OkResult,
    PartialPatternMatcher,
    PatternMatcher,
    RemainingUnmatchedErrors,
    Result,
    TaggedError,
    fullMatch,
    partialMatch,
} from "../index.js";

export type DefaultEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A
> = {
    "*": (e: [AErr, ADeps]) => Promise<A>;
};

export type FullEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A
> = {
    [K in AErr["_tag"]]: (e: [ErrorFromTag<AErr, K>, ADeps]) => Promise<A>;
};

export type PartialEffectErrorPatternMatcher<
    ADeps,
    AErr extends TaggedError,
    A
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
    PM extends PartialEffectErrorPatternMatcher<ADeps, AErr, A>
>(
    deps: ADeps,
    result: Result<A, AErr>,
    matcher: PM
): Promise<Result<A, RemainingUnmatchedErrors<AErr, PM>>> {
    if (result.isOk()) {
        return result as any;
    }
    const resultMatcher: PartialPatternMatcher<AErr, Promise<A>> = {};
    for (const key in matcher) {
        resultMatcher[key] = (e: TaggedError) => {
            return matcher[key as keyof PM]!([e as any, deps]);
        };
    }
    const v = partialMatch(result.unwrapError() as AErr, resultMatcher) as
        | Promise<A>
        | undefined;
    if (!v) {
        return result as any;
    }
    return Result.ok(await v) as any;
}

export async function effectErrorFullMatch<
    ADeps,
    AErr extends TaggedError,
    A,
    PM extends EffectErrorPatternMatcher<ADeps, AErr, A>
>(deps: ADeps, result: Result<A, AErr>, matcher: PM): Promise<OkResult<A>> {
    if (result.isOk()) {
        return result;
    }
    const resultMatcher: PatternMatcher<AErr, Promise<A>> = {} as any;
    for (const key in matcher) {
        resultMatcher[key as keyof PatternMatcher<AErr, Promise<A>>] = (
            e: TaggedError
        ) => {
            const fn = matcher[key as keyof PM];
            return fn([e as any, deps]);
        };
    }
    const v = fullMatch(result.unwrapError() as AErr, resultMatcher);
    return Result.ok(await v) as OkResult<A>;
}
