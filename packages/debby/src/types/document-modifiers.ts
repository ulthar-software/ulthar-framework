import { KeyOf } from "@ulthar/immuty";
import { Document } from "./document.js";

export type DocumentWithFields<
    TSchema extends Document,
    TFields extends KeyOf<TSchema>,
> = {
    [key in TFields]: TSchema[key];
};
