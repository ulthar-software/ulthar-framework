import { Func, KeysMatching, ObjectKey } from "@ulthar/typey";
import { shallowClone } from "./utils/cloning/shallow-clone.js";
import { mutateShallow } from "./utils/mutation/mutate-shallow.js";
import { DeepReadonly } from "./utils/readonly/deep-readonly.js";

export class ImmutableArray<T> {
    private _innerArray: T[] = [];

    constructor(value?: T[]) {
        if (value) this._innerArray = shallowClone(value);
    }

    get length() {
        return this._innerArray.length;
    }

    get(index: number): DeepReadonly<T> {
        return this._innerArray[index];
    }

    // toString(): string {
    //     return this._innerArray.toString();
    // }

    // forEach(callbackfn: (value: DeepReadonly<T>, index: number) => void): void {
    //     this._innerArray.forEach(callbackfn);
    // }

    map<U>(
        callbackfn: (value: DeepReadonly<T>, index: number) => U
    ): ImmutableArray<U> {
        return new ImmutableArray(this._innerArray.map(callbackfn));
    }

    filter(
        predicate: (value: DeepReadonly<T>, index: number) => any
    ): ImmutableArray<T> {
        return new ImmutableArray(this._innerArray.filter(predicate));
    }

    find(predicate: (value: DeepReadonly<T>, index: number) => boolean): T {
        return this._innerArray.find(predicate);
    }

    reduce<U>(
        callbackFn: (
            previousValue: U,
            currentValue: DeepReadonly<T>,
            currentIndex: number
        ) => U,
        initialValue: U
    ): U {
        return this._innerArray.reduce(callbackFn, initialValue);
    }

    // every<S extends T>(
    //     predicate: (value: DeepReadonly<T>, index: number) => value is S
    // ): boolean {
    //     return this._innerArray.every(predicate);
    // }

    // some<S extends T>(
    //     predicate: (value: DeepReadonly<T>, index: number) => value is S
    // ): boolean {
    //     return this._innerArray.some(predicate);
    // }

    // lastIndexOf(searchElement: T, fromIndex?: number): number {
    //     return this._innerArray.lastIndexOf(searchElement, fromIndex);
    // }

    // indexOf(searchElement: T, fromIndex?: number): number {
    //     return this._innerArray.indexOf(searchElement, fromIndex);
    // }

    // join(separator?: string): string {
    //     return this._innerArray.join(separator);
    // }

    // // Mutations
    // unshift(...items: T[]): ImmutableArray<T> {
    //     return this.withCopy((a) => a.unshift(...items));
    // }

    // pop(): ImmutableArray<T> {
    //     let result;
    //     return this.withCopy((a) => (result = a.pop()));
    // }

    push(...items: T[]): ImmutableArray<T> {
        return this.withCopy((a) => a.push(...items));
    }

    // slice(start?: number, end?: number): ImmutableArray<T> {
    //     return this.withCopy((a) => a.slice(start, end));
    // }

    // splice(
    //     start: number,
    //     deleteCount: number,
    //     ...items: T[]
    // ): ImmutableArray<T> {
    //     return this.withCopy((a) => a.splice(start, deleteCount, ...items));
    // }

    // reverse(): ImmutableArray<T> {
    //     return this.withCopy((a) => a.reverse());
    // }

    // set(index: number, element: T): ImmutableArray<T> {
    //     return this.withCopy((a) => (a[index] = element));
    // }

    // //Extension Functions
    private withCopy(mutation: (array: T[]) => void): ImmutableArray<T> {
        return new ImmutableArray(mutateShallow(this._innerArray, mutation));
    }

    // pluck<K extends keyof T>(key: K): ImmutableArray<T[K]> {
    //     return this.map((e) => e[key] as T[K]);
    // }

    // invokeMap<U, K extends KeysMatching<T, Func<U>>>(
    //     key: K
    // ): ImmutableArray<U> {
    //     return this.map((e) => (e[key] as Function)());
    // }

    // groupBy(callbackFn: (element: T) => ObjectKey): Record<ObjectKey, T[]> {
    //     const result: Record<ObjectKey, T[]> = {};
    //     this.forEach((element) => {
    //         const key = callbackFn(element as T);
    //         if (result[key]) result[key].push(element as T);
    //         else result[key] = [element as T];
    //     });
    //     return result;
    // }

    // frequenciesBy(
    //     callbackFn: (element: T) => ObjectKey
    // ): Record<ObjectKey, number> {
    //     const result: Record<ObjectKey, number> = {};
    //     this.forEach((element) => {
    //         const key = callbackFn(element);
    //         if (result[key]) result[key] += 1;
    //         else result[key] = 1;
    //     });
    //     return result;
    // }

    toPlain(): T[] {
        return shallowClone(this._innerArray);
    }

    set(index: number, element: T): ImmutableArray<T>;
    set(index: number, mutation: (elem: T) => T): ImmutableArray<T>;
    set(index: number, mutationOrElement: ((elem: T) => T) | T) {
        if (mutationOrElement instanceof Function) {
            return this.withCopy(
                (a) => (a[index] = mutationOrElement(shallowClone(a[index])))
            );
        }
        return this.withCopy((a) => (a[index] = mutationOrElement));
    }

    // last(): DeepReadonly<T> {
    //     return this._innerArray[this._innerArray.length - 1];
    // }

    isEmpty(): boolean {
        return this._innerArray.length === 0;
    }

    toJSON() {
        return shallowClone(this._innerArray);
    }
}
