import { Effect } from "@ulthar/immuty";
import { IEntityRecord } from "./entity.js";

export interface InsertEffect<T extends IEntityRecord> {
    values(values: T | T[]): Effect;
}
