import { IObjectDiff } from "./object-diff.js";

export function applyDiff<T>(obj: T, diff: IObjectDiff<T>) {
    const result = Object.assign({}, obj, {
        ...diff.createdProps,
    });

    for (const key in diff.updatedProps) {
        const valueDiff: any = diff.updatedProps[key];
        if (valueDiff.newValue) {
            result[key] = valueDiff.newValue;
        } else {
            result[key] = applyDiff(result[key], valueDiff);
        }
    }

    for (const key in diff.deletedProps) {
        delete result[key];
    }

    return result;
}
