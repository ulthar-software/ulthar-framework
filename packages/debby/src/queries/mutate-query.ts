import { IEntity } from "../entity.js";
import { PartialEntityMutation } from "../types/entity-mutation.js";

export interface IMutateQuery<T extends IEntity> {
    from(mutation: PartialEntityMutation<T>): Promise<T>;
}
