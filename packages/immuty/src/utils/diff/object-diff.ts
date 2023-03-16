import { isDateObject } from "../type-detection/is-date-object.js";
import { isObject } from "../type-detection/is-object.js";

/**
 * Generates a deep object diff.
 * The diff comes in the form of
 *
 * @param objectA Previous object state
 * @param objectB New object state
 * @returns
 */
export function objectDiff<T extends Record<string, any>>(
    objectA: T,
    objectB: T
): IObjectDiff<T> | IObjectDiffPropValue<T> | undefined {
    //Handle same object
    if (objectA === objectB) return undefined;

    //Handle non-objects
    if (!isObject(objectA) || !isObject(objectB)) {
        return {
            oldValue: objectA,
            newValue: objectB,
        };
    }

    //Handle dates
    if (isDateObject(objectA) || isDateObject(objectB)) {
        if (objectA.valueOf() == objectB.valueOf()) return undefined;
        return {
            oldValue: objectA,
            newValue: objectB,
        };
    }

    const deletedProps: Partial<T> = {};
    const updatedProps: IObjectDiffUpdatedProps<T> = {};
    const createdProps: Partial<T> = {};

    Object.keys(objectA).forEach((key: keyof T) => {
        if (!Object.hasOwn(objectB, key)) {
            deletedProps[key] = objectA[key];
        } else {
            updatedProps[key] = objectDiff(
                objectA[key],
                objectB[key]
            ) as IMaybeObjectDiff<T[keyof T]>;
        }
    });
    Object.keys(objectB).forEach((key: keyof T) => {
        if (!Object.hasOwn(objectA, key)) {
            createdProps[key] = objectB[key];
        }
    });

    return {
        createdProps,
        updatedProps,
        deletedProps,
    };
}

export interface IObjectDiff<T> {
    /**
     * New properties and their values
     */
    createdProps: Partial<T>;

    /**
     * Deleted properties and their values before deletion
     */
    deletedProps: Partial<T>;

    /**
     * Updated properties with their old and new values
     */
    updatedProps: IObjectDiffUpdatedProps<T>;
}

export type IObjectDiffUpdatedProps<T> = {
    [key in keyof T]?: IMaybeObjectDiff<T[key]>;
};

export type IMaybeObjectDiff<T> = T extends Record<string, any>
    ? IObjectDiff<T>
    : IObjectDiffPropValue<T>;

export interface IObjectDiffPropValue<T> {
    oldValue: T;
    newValue: T;
}
