import { ExcludedKeysTypes, IEntity } from "../entity.js";

export type FullEntityMutation<T extends IEntity> = Omit<T, ExcludedKeysTypes>;

export type PartialEntityMutation<T extends IEntity> = Partial<
    FullEntityMutation<T>
>
