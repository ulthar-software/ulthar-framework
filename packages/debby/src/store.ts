import { ClassOfType } from "@ulthar/typey";
import { IEntity } from "./entity.js";
import { IInsertQuery } from "./queries/create-query";
import { IDeleteQuery } from "./queries/delete-query";
import { IMutateQuery } from "./queries/mutate-query";
import { IQuery } from "./queries/entity-query.js";
import { ISelectQuery } from "./queries/select-query.js";

export type IEntityModelMap = {
    [key: string]: ClassOfType<IEntity>;
};

export type EntityModelMapWith<
    K extends string,
    T extends IEntity
> = IEntityModelMap & {
    [key in K]: ClassOfType<T>;
};

export abstract class IStore<EntityModelMap extends IEntityModelMap> {
    constructor(protected models: EntityModelMap) {}

    abstract query<K extends keyof EntityModelMap>(
        entity: K
    ): IQuery<InstanceType<EntityModelMap[K]>>;

    abstract select<K extends keyof EntityModelMap>(
        entity: K
    ): ISelectQuery<EntityModelMap, K>;

    abstract insert<K extends keyof EntityModelMap>(
        entity: K
    ): IInsertQuery<InstanceType<EntityModelMap[K]>>;

    abstract mutate<K extends keyof EntityModelMap>(
        entity: K
    ): IMutateQuery<InstanceType<EntityModelMap[K]>>;

    abstract delete<K extends keyof EntityModelMap>(
        entity: K
    ): IDeleteQuery<InstanceType<EntityModelMap[K]>>;
}
