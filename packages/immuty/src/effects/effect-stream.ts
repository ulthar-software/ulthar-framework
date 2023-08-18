import { IEventSource } from "../events/event-stream.js";
import {
    ArrayType,
    Effect,
    ErrorWrapper,
    Fn,
    MaybePromise,
    Result,
    TaggedError,
    liftFn,
} from "../index.js";
import { Schedule } from "../time/schedule.js";
import { MergeTypes } from "../types/merge-types.js";
import { EffectFn, PipeableEffectFn } from "./effect-fn.js";
import { listEffectToAsyncGenerator } from "./effect-to-generator.js";

export class EffectStream<
    A = void,
    AErr extends TaggedError = never,
    BDeps = void,
    B = void,
    BErr extends TaggedError = never,
> {
    static fromListEffect<
        A extends unknown[],
        ADeps = void,
        AErr extends TaggedError = never,
    >(
        effect: EffectFn<ADeps, A, AErr>
    ): EffectStream<ArrayType<A>, AErr, ADeps, ArrayType<A>, AErr> {
        return new EffectStream(
            ([, res]) => Promise.resolve(res),
            listEffectToAsyncGenerator<A, ADeps, AErr>(effect)
        );
    }

    static fromSchedule<BDeps, B, BErr extends TaggedError>(
        f: EffectFn<BDeps, B, BErr>,
        schedule: Schedule
    ): EffectStream<void, never, BDeps, B, BErr> {
        return new EffectStream(
            async ([deps]) => {
                return await f(deps);
            },
            () => schedule
        );
    }

    map<CDeps, C, CErr extends TaggedError>(
        g: PipeableEffectFn<CDeps, B, C, CErr>
    ): EffectStream<A, AErr, MergeTypes<BDeps, CDeps>, C, BErr | CErr> {
        return new EffectStream<
            A,
            AErr,
            MergeTypes<BDeps, CDeps>,
            C,
            BErr | CErr
        >(
            async ([deps, result]) => {
                const fResult = await this.f([deps as BDeps, result]);
                if (fResult.isError()) {
                    return fResult as Result<C, BErr | CErr>;
                }
                return await g([fResult.unwrap(), deps as CDeps]);
            },
            this.evtSource as (
                deps: MergeTypes<BDeps, CDeps>
            ) => IEventSource<A, AErr>
        );
    }

    tap(
        g: Fn<Result<B, AErr | BErr>, MaybePromise<void>>
    ): EffectStream<A, AErr, BDeps, B, BErr> {
        return new EffectStream(async ([deps, value]) => {
            const result = await this.f([deps, value]);
            await g(result);
            return result;
        }, this.evtSource);
    }

    mapSync<C, CDeps = void, CErr extends TaggedError = never>(
        g: Fn<[B, CDeps], C>,
        e?: ErrorWrapper<CErr>
    ): EffectStream<A, AErr, MergeTypes<BDeps, CDeps>, C, BErr | CErr> {
        return this.map(liftFn((x) => Promise.resolve(g(x)), e));
    }

    collectAll(): Effect<BDeps, B[], AErr | BErr> {
        return Effect.from(async (deps: BDeps) => {
            const result: B[] = [];
            let lastError: Result<B[], AErr | BErr> | undefined = undefined;

            await this.tap((res) => {
                if (res.isOk()) {
                    result.push(res.unwrap());
                } else {
                    lastError = res as Result<B[], AErr | BErr>;
                }
            }).run(deps);

            // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
            if (lastError) {
                return lastError;
            }

            return Result.ok(result);
        });
    }

    private constructor(
        private readonly f: Fn<
            [BDeps, Result<A, AErr>],
            Promise<Result<B, BErr>>
        >,
        private readonly evtSource: (deps: BDeps) => IEventSource<A, AErr>
    ) {}

    async run(deps: BDeps): Promise<void> {
        for await (const result of this.evtSource(deps)) {
            await this.f([deps, result]);
        }
    }
}
