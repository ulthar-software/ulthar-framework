import { AsyncResult, Result, TaggedError } from "../index.js";
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
}
