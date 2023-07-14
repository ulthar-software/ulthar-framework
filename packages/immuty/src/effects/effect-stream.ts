import { EventSource } from "../events/event-source.js";
import { ErrorResult, Fn, Result, TaggedError } from "../index.js";
import { Schedule } from "../time/schedule.js";
import { MergeTypes } from "../types/merge-types.js";
import { EffectFn, PipeableEffectFn } from "./effect-fn.js";

export class EffectStream<
    EventResult extends Result<any, any> | void,
    ADeps = void,
    A = void,
    AErr extends TaggedError = never
> {
    static fromSchedule<ADeps, A, AErr extends TaggedError>(
        f: EffectFn<ADeps, A, AErr>,
        schedule: Schedule
    ): EffectStream<void, ADeps, A, AErr> {
        return new EffectStream(async ([deps]) => {
            return await f(deps);
        }, schedule);
    }

    map<BDeps, B, BErr extends TaggedError>(
        g: PipeableEffectFn<BDeps, A, B, BErr>
    ): EffectStream<EventResult, MergeTypes<ADeps, BDeps>, B, AErr | BErr> {
        return new EffectStream(async ([deps, result]) => {
            const fResult = await this.f([deps as ADeps, result]);
            if (fResult.isError()) {
                return fResult as any;
            }
            return await g([fResult.unwrap(), deps as BDeps]);
        }, this.evtSource);
    }

    private constructor(
        private readonly f: Fn<[ADeps, EventResult], Promise<Result<A, AErr>>>,
        private readonly evtSource: EventSource<EventResult, AErr>
    ) {}

    async start(deps: ADeps): Promise<void> {
        for await (const result of this.evtSource) {
            await this.f([deps, result as EventResult]);
        }
    }
}
