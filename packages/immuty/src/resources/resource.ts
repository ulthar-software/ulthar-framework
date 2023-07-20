/* eslint-disable @typescript-eslint/unbound-method */
import {
    EffectConstructor,
    MaybePromise,
    MergeTypes,
    Result,
    TaggedError,
    liftFn,
} from "../index.js";

export class Resource<
    ResourceType,
    AcquireDependencyType = void,
    AcquireErrorType extends TaggedError = never,
> {
    constructor(
        opts: ResourceOptions<
            ResourceType,
            AcquireDependencyType,
            AcquireErrorType
        >
    ) {
        this.acquire = liftFn(opts.onAcquire, opts.onError);
        this.release = opts.onRelease;
    }
    acquire: (
        deps: AcquireDependencyType
    ) => Promise<Result<ResourceType, AcquireErrorType>>;
    release: () => MaybePromise<void>;

    async useWith<ResultType, EffectDepType, EffectErrType extends TaggedError>(
        deps: MergeTypes<AcquireDependencyType, EffectDepType>,
        usageEffect: EffectConstructor<
            ResourceType,
            ResultType,
            EffectDepType,
            EffectErrType
        >
    ): Promise<Result<ResultType, AcquireErrorType | EffectErrType>> {
        return (await this.acquire(deps as AcquireDependencyType)).asyncFlatMap(
            (resourceValue) =>
                usageEffect(resourceValue)
                    .run(deps as EffectDepType)
                    .then((result) => {
                        void this.release();
                        return result;
                    })
        );
    }
}

export interface ResourceOptions<
    ResourceType,
    AcquireDependencyType = void,
    AcquireErrorType extends TaggedError = never,
> {
    onAcquire(deps: AcquireDependencyType): Promise<ResourceType>;
    onRelease(): MaybePromise<void>;
    onError?(error: unknown): MaybePromise<AcquireErrorType>;
}
