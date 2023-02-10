import { EntityId, IEntity } from "./entity.js";

export type RelationalTable<T extends IEntity> = Record<EntityId, T>;
