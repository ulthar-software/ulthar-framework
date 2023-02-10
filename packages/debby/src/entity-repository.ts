import { EntityId, EntityIdProperty, IEntity } from "./entity.js";

export type FullEntityMutation<T extends IEntity> = Omit<T, "id">;

export type PartialEntityMutation<T extends IEntity> = Partial<
    FullEntityMutation<T>
>;

export interface IEntityRepository<T extends IEntity> {
    findById(id: EntityId): Promise<T | null>;
    mutate(id: EntityId, entityMutations: PartialEntityMutation<T>): Promise<T>;
    save(entity: T): Promise<void>;
}
