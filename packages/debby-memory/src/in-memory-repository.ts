import {
    ClassOfType,
    Immutable,
    makeDeepImmutable,
    Maybe,
} from "@ulthar/typey";
import { Errors } from "./errors.js";
import {
    EntityId,
    FullEntityMutation,
    IEntity,
    IEntityRepository,
    PartialEntityMutation,
} from "@ulthar/debby";

export interface InMemoryRepositoryOptions<T> {
    uuidFactory: () => string;
}

export class InMemoryRepository<T extends IEntity>
    implements IEntityRepository<T>
{
    private table: Map<string, T> = new Map<string, T>();
    private uuidFactory: () => string;

    constructor(
        private entityConstructor: ClassOfType<T>,
        opts: InMemoryRepositoryOptions<T>
    ) {
        this.uuidFactory = opts.uuidFactory;
    }

    async findById(id: string): Promise<Maybe<Immutable<T>>> {
        return this.table.has(id)
            ? makeDeepImmutable(this.table.get(id))
            : undefined;
    }

    async create(entityData: FullEntityMutation<T>): Promise<Immutable<T>> {
        const entity = new this.entityConstructor();
        entity.id = this.uuidFactory();
        Object.assign(entity, entityData);
        this.table.set(entity.id, entity);
        return makeDeepImmutable(entity);
    }

    async mutate(
        id: EntityId,
        entityMutations: PartialEntityMutation<T>
    ): Promise<Immutable<T>> {
        const oldEntity = this.table.get(id);
        if (!oldEntity) throw Errors.render("ENTITY_NOT_FOUND", { id });
        const entity = Object.assign(oldEntity, entityMutations);
        return makeDeepImmutable(entity);
    }
}
