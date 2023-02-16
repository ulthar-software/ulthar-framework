import { Immutable, Maybe } from "@ulthar/typey";
import { IEntityRepository } from "./entity-repository.js";
import { EntityId, IEntity } from "./entity.js";

export class EntityReference<T extends IEntity> {
    static FromJSON<T extends IEntity>(arg0: any) {
        return new EntityReference<T>(arg0.repository, arg0.id);
    }
    static readonly TYPE: string = "EntityReference";
    static Empty<T extends IEntity>(repository: string): EntityReference<T> {
        return new EntityReference<T>(repository);
    }
    static FromEntity<T extends IEntity>(
        repository: string,
        entity: IEntity
    ): EntityReference<T> {
        return new EntityReference<T>(repository, entity.id);
    }
    static FromId<T extends IEntity>(
        repository: string,
        entityId: EntityId
    ): EntityReference<T> {
        return new EntityReference<T>(repository, entityId);
    }
    constructor(public repository: string, public id?: EntityId) {}

    async getEntity(repo: IEntityRepository<T>): Promise<Maybe<Immutable<T>>> {
        if (!this.id) return undefined;
        return await repo.findById(this.id);
    }

    toJSON() {
        return {
            _type: EntityReference.TYPE,
            ...this,
        };
    }
}
