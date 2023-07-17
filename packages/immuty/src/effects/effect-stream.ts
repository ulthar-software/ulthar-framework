import { IEventSource } from "../events/event-stream.js";
import { Fn, Result, TaggedError } from "../index.js";
import { Schedule } from "../time/schedule.js";
import { MergeTypes } from "../types/merge-types.js";
import { EffectFn, PipeableEffectFn } from "./effect-fn.js";

export class EffectStream<
    A = void,
    AErr extends TaggedError = never,
    BDeps = void,
    B = void,
    BErr extends TaggedError = never,
> {
    static fromSchedule<BDeps, B, BErr extends TaggedError>(
        f: EffectFn<BDeps, B, BErr>,
        schedule: Schedule
    ): EffectStream<void, never, BDeps, B, BErr> {
        return new EffectStream(async ([deps]) => {
            return await f(deps);
        }, schedule);
    }

    map<CDeps, C, CErr extends TaggedError>(
        g: PipeableEffectFn<CDeps, B, C, CErr>
    ): EffectStream<A, AErr, MergeTypes<BDeps, CDeps>, C, BErr | CErr> {
        return new EffectStream(async ([deps, result]) => {
            const fResult = await this.f([deps as BDeps, result]);
            if (fResult.isError()) {
                return fResult as unknown as Result<C, BErr | CErr>; //limits of error type knowledge of the "ok" branch
            }
            return await g([fResult.unwrap(), deps as CDeps]);
        }, this.evtSource);
    }

    private constructor(
        private readonly f: Fn<
            [BDeps, Result<A, AErr>],
            Promise<Result<B, BErr>>
        >,
        private readonly evtSource: IEventSource<A, AErr>
    ) {}

    async start(deps: BDeps): Promise<void> {
        for await (const result of this.evtSource) {
            await this.f([deps, result]);
        }
    }
}
