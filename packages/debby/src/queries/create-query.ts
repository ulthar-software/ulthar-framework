import { IEntity } from "../entity.js";
import { FullEntityMutation } from "../types/entity-mutation.js";

export interface IInsertQuery<T extends IEntity> {
    /**
     * Creates an instance in the store
     */
    from(entity: FullEntityMutation<T>): Promise<T>;
}
