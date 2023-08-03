import { PosixDate } from "@ulthar/immuty";

export type Id = string;

export interface IEntityRecord {
    id: Id;
}

export interface CreatedEntityRecord extends IEntityRecord {
    createdAt: PosixDate;
    lastModifiedAt: PosixDate;
}

export interface UserCreatedEntityRecord extends IEntityRecord {
    createdBy: Id;
    lastModifiedBy: Id;
}
