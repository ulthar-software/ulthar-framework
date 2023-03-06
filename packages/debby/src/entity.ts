export type EntityIdType = string;
export type EntityIdProperty = "id";

export type ExcludedKeysTypes = EntityIdProperty;

export interface IEntity {
    id: EntityIdType;
}
