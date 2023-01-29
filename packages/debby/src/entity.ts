import { ClassOfType } from "@ulthar/typey";

export type EntityId = string;

export interface IEntity {
    id: EntityId;
}

export interface IEntityRepository<T extends IEntity> {
    findById(id: EntityId): Promise<T | null>;
    mutate(
        id: EntityId,
        entityMutations: Partial<Exclude<T, "id">>
    ): Promise<T>;
    save(entity: T): Promise<void>;
}

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

    async getReference(repo: IEntityRepository<T>): Promise<T | null> {
        if (!this.id) return null;
        return await repo.findById(this.id);
    }
}

export type RelationalTable<T extends IEntity> = Record<EntityId, T>;

export class InMemoryRepository<T extends IEntity>
    implements IEntityRepository<T>
{
    private table: RelationalTable<T> = {};

    constructor(private entityConstructor: ClassOfType<T>) {}

    async findById(id: string): Promise<T | null> {
        return clone(this.table[id]) ?? null;
    }

    async save(entity: T): Promise<void> {
        this.table[entity.id] = clone(entity);
    }

    async mutate(
        id: EntityId,
        entityMutations: Partial<Exclude<T, "id">>
    ): Promise<T> {
        const oldEntity = await this.findById(id);
        if (!oldEntity) throw new Error("Entity not found, cannot mutate");
        const entity = Object.assign(oldEntity!, entityMutations);
        return entity as T;
    }
}

export function clone<T>(thing: T): T {
    return thing;
}
