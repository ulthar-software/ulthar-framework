import { IEntity } from "../entity.js";

export interface IDeleteQuery<T extends IEntity> {
    /**
     * Deletes the first entity that matches the predicate
     */
    oneWhere(predicate: (value: T) => unknown): Promise<void>;

    /**
     * Deletes all entities that matches the predicate
     */
    allWhere(predicate: (value: T) => unknown): Promise<void>;
}
