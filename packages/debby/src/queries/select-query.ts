import { DotNotationPath } from "@ulthar/typey";
import { IEntityModelMap } from "../store.js";

export type InstanceModelMap<T> = {
    [key in keyof T]: T[key] extends abstract new (...args: any) => infer R
        ? InstanceType<T[key]>
        : never;
};

export interface ISelectQuery<
    EntityModelMap extends IEntityModelMap,
    T extends keyof EntityModelMap
> {
    leftJoin<K extends keyof EntityModelMap>(
        model: K,
        on: DotNotationPath<InstanceModelMap<EntityModelMap>>,
        and: DotNotationPath<InstanceModelMap<EntityModelMap>>
    ): ISelectQuery<EntityModelMap, T | K>;
}
