import { Immutable, Maybe } from "@ulthar/typey";
import { EntityId, IEntity } from "./entity.js";
import {
    FullEntityMutation,
    PartialEntityMutation,
} from "./types/entity-mutation.js";

export interface IEntityRepository<T extends IEntity> {
    findById(id: EntityId): Promise<Maybe<Immutable<T>>>;
    mutate(
        id: EntityId,
        entityMutations: PartialEntityMutation<T>
    ): Promise<Immutable<T>>;
    create(entity: FullEntityMutation<T>): Promise<Immutable<T>>;
}
