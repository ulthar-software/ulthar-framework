import { Func, KeysMatching, ObjectKey } from "@ulthar/typey";
import { shallowClone } from "./utils/cloning/shallow-clone.js";
import { mutateShallow } from "./utils/mutation/mutate-shallow.js";

export class ImmutableArray<T> {
    private _innerArray: T[] = [];
    constructor(value?: T[]) {
        if (value) this._innerArray = shallowClone(value);
    }

    get length() {
        return this._innerArray.length;
    }

    get(index: number): Readonly<T> {
        return this._innerArray[index];
    }

    toString(): string {
        return this._innerArray.toString();
    }

    toLocaleString(): string {
        return this._innerArray.toLocaleString();
    }

    forEach(callbackfn: (value: Readonly<T>, index: number) => void): void {
        this._innerArray.forEach(callbackfn);
    }

    map<U>(
        callbackfn: (value: Readonly<T>, index: number) => U
    ): ImmutableArray<U> {
        return new ImmutableArray(this._innerArray.map(callbackfn));
    }

    filter<S extends T>(
        predicate: (value: Readonly<T>, index: number) => value is S
    ): ImmutableArray<S> {
        return new ImmutableArray(this._innerArray.filter(predicate));
    }

    find(
        predicate: (value: Readonly<T>, index: number) => boolean
    ): T | undefined {
        return this._innerArray.find(predicate);
    }

    reduce<U>(
        callbackFn: (
            previousValue: U,
            currentValue: Readonly<T>,
            currentIndex: number
        ) => U,
        initialValue: U
    ): U {
        return this._innerArray.reduce(callbackFn, initialValue);
    }

    every<S extends T>(
        predicate: (value: Readonly<T>, index: number) => value is S
    ): boolean {
        return this._innerArray.every(predicate);
    }

    some<S extends T>(
        predicate: (value: Readonly<T>, index: number) => value is S
    ): boolean {
        return this._innerArray.some(predicate);
    }

    lastIndexOf(searchElement: T, fromIndex?: number): number {
        return this._innerArray.lastIndexOf(searchElement, fromIndex);
    }

    indexOf(searchElement: T, fromIndex?: number): number {
        return this._innerArray.indexOf(searchElement, fromIndex);
    }

    join(separator?: string): string {
        return this._innerArray.join(separator);
    }

    // Mutations
    unshift(...items: T[]): ImmutableArray<T> {
        return this.withCopy((a) => a.unshift(...items));
    }

    pop(): ImmutableArray<T> {
        let result;
        return this.withCopy((a) => (result = a.pop()));
    }

    push(...items: T[]): ImmutableArray<T> {
        return this.withCopy((a) => a.push(...items));
    }

    slice(start?: number, end?: number): ImmutableArray<T> {
        return this.withCopy((a) => a.slice(start, end));
    }

    splice(
        start: number,
        deleteCount: number,
        ...items: T[]
    ): ImmutableArray<T> {
        return this.withCopy((a) => a.splice(start, deleteCount, ...items));
    }

    reverse(): ImmutableArray<T> {
        return this.withCopy((a) => a.reverse());
    }

    set(index: number, element: T): ImmutableArray<T> {
        return this.withCopy((a) => (a[index] = element));
    }

    //Extension Functions
    withCopy(mutation: (array: T[]) => void): ImmutableArray<T> {
        const cp = new ImmutableArray(this._innerArray.slice());
        mutation(cp._innerArray);
        return cp;
    }

    pluck<K extends keyof T>(key: K): ImmutableArray<T[K]> {
        return this.map((e) => e[key]);
    }

    invokeMap<U, K extends KeysMatching<T, Func<U>>>(
        key: K
    ): ImmutableArray<U> {
        return this.map((e) => (e[key] as Function)());
    }

    groupBy(callbackFn: (element: T) => ObjectKey): Record<ObjectKey, T[]> {
        const result: Record<ObjectKey, T[]> = {};
        this.forEach((element) => {
            const key = callbackFn(element);
            if (result[key]) result[key].push(element);
            else result[key] = [element];
        });
        return result;
    }

    frequenciesBy(
        callbackFn: (element: T) => ObjectKey
    ): Record<ObjectKey, number> {
        const result: Record<ObjectKey, number> = {};
        this.forEach((element) => {
            const key = callbackFn(element);
            if (result[key]) result[key] += 1;
            else result[key] = 1;
        });
        return result;
    }

    asMutable(): T[] {
        return this._innerArray.slice();
    }

    mutateOne(index: number, mutation: (elem: T) => void) {
        return this.withCopy(
            (a) => (a[index] = mutateShallow(a[index], mutation))
        );
    }

    mutateEach(mutation: (elem: T) => void) {
        return this.map((e) => mutateShallow(e, mutation));
    }

    last(): Readonly<T> {
        return this._innerArray[this._innerArray.length - 1];
    }
}
