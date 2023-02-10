import { IEntityRepository } from "./entity-repository.js";
import { EntityId, IEntity } from "./entity.js";

export class EntityReference<T extends IEntity> {
    static Empty<T extends IEntity>(): EntityReference<T> {
        return new EntityReference<T>();
    }
    static FromEntity<T extends IEntity>(entity: IEntity): EntityReference<T> {
        return new EntityReference<T>(entity.id);
    }
    static FromId<T extends IEntity>(entityId: EntityId): EntityReference<T> {
        return new EntityReference<T>(entityId);
    }
    constructor(public id?: EntityId) {}

    async getEntity(repo: IEntityRepository<T>): Promise<T | null> {
        if (!this.id) return null;
        return await repo.findById(this.id);
    }
}
