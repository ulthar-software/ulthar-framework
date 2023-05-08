// import { IEntity } from "@ulthar/debby";
export interface IEntity {
    id: string;
}

export interface Package extends IEntity {
    name: string;
    version: string;
    description: string;
}
