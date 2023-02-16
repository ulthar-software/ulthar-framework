export type EntityId = string;
export type EntityIdProperty = "id";
export type EntityTypeProperty = "type";

export type ExcludedKeysTypes = EntityIdProperty;

export interface IEntity {
    id: EntityId;
}
