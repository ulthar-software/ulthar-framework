import { ClassOfType, deepClone } from "@ulthar/typey";
import {
    PartialEntityMutation,
    IEntityRepository,
} from "./entity-repository.js";
import { EntityId, IEntity } from "./entity.js";
import { Errors } from "./errors.js";
import { IndexTable } from "./index-table.js";
import { RelationalTable } from "./relational-table.js";
import { IndexOf } from "./types/index-of.js";
import { IndexType } from "./types/index-type.js";

export interface InMemoryRepositoryOptions<T> {
    indexes?: IndexOf<T>[];
    uuidFactory: () => string;
}

export class InMemoryRepository<T extends IEntity>
    implements IEntityRepository<T>
{
    private table: RelationalTable<T> = {};
    private uuidFactory: () => string;
    private indexes: IndexOf<T>[];

    private indexTables: Record<string, IndexTable<T>> = {};

    constructor(
        private entityConstructor: ClassOfType<T>,
        opts: InMemoryRepositoryOptions<T>
    ) {
        this.uuidFactory = opts.uuidFactory;
        this.indexes = opts.indexes ?? [];

        for (const index of this.indexes) {
            this.indexTables[index as string] = new IndexTable<T>();
        }
    }

    async findById(id: string): Promise<T | null> {
        return this.table[id] ? deepClone(this.table[id]) : null;
    }

    async save(entity: T): Promise<void> {
        this.table[entity.id] = deepClone(entity);
        for (const index of this.indexes) {
            this.indexTables[index as string].addEntity(
                this.table[entity.id][index] as string | number,
                this.table[entity.id]
            );
        }
    }

    async create(entityData: PartialEntityMutation<T>): Promise<T> {
        const entity = new this.entityConstructor();
        entity.id = this.uuidFactory();
        Object.assign(entity, entityData);
        await this.save(entity);
        return entity;
    }

    async mutate(
        id: EntityId,
        entityMutations: PartialEntityMutation<T>
    ): Promise<T> {
        const oldEntity = this.table[id];
        if (!oldEntity) Errors.throw("ENTITY_NOT_FOUND", { id });
        const entity = Object.assign(oldEntity!, entityMutations);

        return entity as T;
    }

    async findOneByIndex<K extends IndexOf<T>>(index: K, value: T[K]) {
        if (this.indexTables[index as string]) {
            return deepClone(
                this.indexTables[index as string].getFirst(value as IndexType)
            );
        }
        Errors.throw("INDEX_NOT_DEFINED");
    }
}
