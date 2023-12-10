import { ErrorFromTag } from "../errors/error-from-tag.js";
import {
    ErrorPatternMatcher,
    PartialErrorPatternMatcher,
    RemainingUnmatchedErrors,
} from "../errors/error-pattern-matcher.js";
import {
    AsyncResult,
    CaseMatcher,
    DefaultVariant,
    KeyOf,
    Result,
    TaggedError,
    fullMatch,
    isVariant,
} from "../index.js";
import {
    ExtractedErrors,
    ExtractedValue,
    InferredResult,
} from "../results/resultify.js";
import { Fn } from "../utils/functions/function.js";
import { Immutable } from "../utils/immutability/immutable.js";
import { MaybePromise } from "../utils/types/maybe-promise.js";
import { MergeTypes } from "../utils/types/merge-types.js";
import { effectify } from "./effectify.js";

export class Effect<TDeps, TResultValue, TError extends TaggedError = never> {
    static from<TFnResult extends MaybePromise<unknown>, TDeps = void>(
        fn: Fn<[TDeps], TFnResult>
    ): Effect<
        TDeps,
        ExtractedValue<InferredResult<TFnResult>>,
        ExtractedErrors<InferredResult<TFnResult>>
    > {
        return new Effect(effectify(fn));
    }

    constructor(
        private readonly f: Fn<[TDeps], AsyncResult<TResultValue, TError>>
    ) {}

    async run(deps: TDeps): Promise<Result<TResultValue, TError>> {
        return await this.f(deps).resolve();
    }

    map<TFnResult extends MaybePromise<unknown>, TNewDeps = void>(
        fn: Fn<[Immutable<TResultValue>, TNewDeps], TFnResult>
    ): Effect<
        MergeTypes<TDeps, TNewDeps>,
        ExtractedValue<InferredResult<TFnResult>>,
        TError | ExtractedErrors<InferredResult<TFnResult>>
    > {
        return new Effect((deps) => {
            const result = this.f(deps as TDeps);
            return result.asyncResultMap(
                effectify((result) => fn(result, deps as TNewDeps))
            );
        });
    }

    flatMap<
        TNewResultValue,
        TNewDeps = void,
        TNewErrors extends TaggedError = never,
    >(
        fn: Fn<
            [Immutable<TResultValue>, TNewDeps],
            Effect<TNewDeps, TNewResultValue, TNewErrors>
        >
    ): Effect<
        MergeTypes<TDeps, TNewDeps>,
        TNewResultValue,
        TError | TNewErrors
    > {
        return new Effect((deps) => {
            const result = this.f(deps as TDeps);
            return result.asyncResultMap((result) =>
                fn(result, deps as TNewDeps).f(deps as TNewDeps)
            );
        });
    }

    tap<TNewDeps = void>(
        fn: Fn<[Immutable<TResultValue>, TNewDeps], MaybePromise<void>>
    ): Effect<MergeTypes<TDeps, TNewDeps>, TResultValue, TError> {
        return new Effect((deps) => {
            const result = this.f(deps as TDeps);
            return result.asyncMap(async (result) => {
                await fn(result, deps as TNewDeps);
                return result as TResultValue;
            });
        });
    }

    when<
        TNewResultValue,
        TNewDeps = void,
        TNewError extends TaggedError = never,
    >(
        matcher: CaseMatcher<
            TResultValue,
            Fn<[TResultValue], Effect<TNewDeps, TNewResultValue, TNewError>>
        >
    ): Effect<
        MergeTypes<TDeps, TNewDeps>,
        TNewResultValue,
        TError | TNewError
    > {
        return Effect.from(async (deps) => {
            const result = await this.f(deps as TDeps).resolve();
            if (result.isOk()) {
                const value = result.unwrap();
                const key = (
                    isVariant(value) ? value._tag : (value as string | number)
                ) as KeyOf<typeof matcher>;

                if (key in matcher && matcher[key]) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know it's not undefined
                    return await matcher[key]!(value).run(deps as TNewDeps);
                } else if (
                    DefaultVariant in matcher &&
                    matcher[DefaultVariant]
                ) {
                    return await matcher[DefaultVariant](value).run(
                        deps as TNewDeps
                    );
                }
                return Result.error(
                    new TaggedError("Unmatched result in when")
                );
            }
            return result;
        }) as Effect<
            MergeTypes<TDeps, TNewDeps>,
            TNewResultValue,
            TError | TNewError
        >;
    }

    repeatWhile(fn: (value: TResultValue) => MaybePromise<boolean>) {
        return Effect.from(async (deps) => {
            let result = await this.f(deps as TDeps).resolve();
            while (result.isOk() && (await fn(result.unwrap()))) {
                result = await this.f(deps as TDeps).resolve();
            }
            return result;
        }) as Effect<TDeps, TResultValue, TError>;
    }

    retry(maxTimes: number) {
        return Effect.from(async (deps) => {
            let result = await this.f(deps as TDeps).resolve();
            let i = 0;
            while (result.isError() && i < maxTimes) {
                result = await this.f(deps as TDeps).resolve();
                i++;
            }
            return result;
        }) as Effect<TDeps, TResultValue, TError>;
    }

    catchSome<
        PM extends PartialErrorPatternMatcher<
            TError,
            Effect<TNewDeps, TResultValue, never>
        >,
        TNewDeps = void,
    >(errorMatcher: PM) {
        return Effect.from(async (deps) => {
            const result = await this.f(deps as TDeps).resolve();
            if (result.isError()) {
                const error = result.unwrapError();
                const key = error._tag as KeyOf<typeof errorMatcher>;
                if (key in errorMatcher && errorMatcher[key]) {
                    // eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- We know it's not undefined
                    return await errorMatcher[key]!(
                        error as ErrorFromTag<TError, string>
                    ).run(deps as TNewDeps);
                }
            }
            return result;
        }) as unknown as Effect<
            MergeTypes<TDeps, TNewDeps>,
            TResultValue,
            RemainingUnmatchedErrors<TError, PM>
        >;
    }

    catchAll<TNewDeps = void>(
        matcher: ErrorPatternMatcher<
            TError,
            Effect<TNewDeps, TResultValue, never>
        >
    ): Effect<MergeTypes<TDeps, TNewDeps>, TResultValue, never> {
        return Effect.from(async (deps) => {
            const result = await this.f(deps as TDeps).resolve();
            if (result.isError()) {
                const effect = fullMatch(
                    result.unwrapError(),
                    matcher
                ) as Effect<TNewDeps, TResultValue, never>;

                return await effect.run(deps as TNewDeps);
            }
            return result as Result<TResultValue, never>;
        });
    }
}
