import { Immutable, DotNotationPath } from "@ulthar/typey";
import { IEntity } from "../entity.js";

export interface IQuery<T extends IEntity> {
    find(predicate: (value: T) => unknown): IQueryResult<T>;
    filter(predicate: (value: T) => unknown): IQuery<T>;
    map<U>(callbackfn: (value: T) => U): IQueryResult<U>;
    slice(start?: number, end?: number): IQuery<T>;
    sort(compareFn: (a: T, b: T) => number): IQuery<T>;
    every(predicate: (value: T) => unknown, thisArg?: any): Promise<boolean>;
    some(predicate: (value: T) => unknown, thisArg?: any): Promise<boolean>;
    reduce(callbackfn: (previousValue: T, currentValue: T) => T): Promise<T>;
    reduce<U>(
        callbackfn: (previousValue: U, currentValue: T) => U,
        initialValue: U
    ): Promise<U>;
    populate(propertyPaths: DotNotationPath<T>[]): IQuery<T>;
    get(): Promise<Immutable<T[]>>;
}

export interface IQueryResult<T> {
    get(): Promise<Immutable<T>>;
    transform<U>(callbackfn: (value: T) => U): IQueryResult<U>;
    populate(propertyPaths: DotNotationPath<T>[]): IQueryResult<T>;
}
