import { DocumentRecord, KeyOf } from "@ulthar/immuty";

export type DocumentWithFields<
    TSchema extends DocumentRecord,
    TFields extends KeyOf<TSchema>,
> = {
    [key in TFields]: TSchema[key];
};
