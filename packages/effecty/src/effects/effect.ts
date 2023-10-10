import {
    AsyncResult,
    CaseMatcher,
    DefaultVariant,
    KeyOf,
    Result,
    TaggedError,
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

    // catchSome<
    //     PM extends PartialErrorPatternMatcher<
    //         TError,
    //         MaybePromise<TResultValue>
    //     >,
    // >();

    // catchAll(matcher: ErrorPatternMatcher<TError, MaybePromise<TResultValue>>) {
    //     return Effect.from(async (deps) => {
    //         const result = await this.f(deps as TDeps).resolve();
    //         if (result.isError()) {
    //             return fullMatch(result.error, matcher);
    //         }
    //         return result;
    //     }) as Effect<TDeps, TResultValue, never>;
    // }
}
