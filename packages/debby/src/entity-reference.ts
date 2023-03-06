import { Immutable, Maybe } from "@ulthar/typey";
import { EntityIdType, IEntity } from "./entity.js";
import { EntityModelMapWith, IStore } from "./store.js";

export class EntityReference<T extends IEntity, K extends string> {
    id: Maybe<EntityIdType>;

    private _entity: Maybe<Immutable<T>>;

    public get value(): Maybe<Immutable<T>> {
        return this._entity;
    }

    get hasReference(): boolean {
        return !!this.id;
    }

    get hasValue(): boolean {
        return !!this._entity;
    }

    constructor(public entityType: K) {}

    fetchEntity(
        store: IStore<EntityModelMapWith<K, T>>
    ): Promise<Immutable<T>> {
        return store
            .query(this.entityType)
            .find((e) => e.id == this.id)
            .get();
    }
}
