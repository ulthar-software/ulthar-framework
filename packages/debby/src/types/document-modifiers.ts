import { DocumentRecord, KeyOf } from "@ulthar/effecty";
import { DocumentAggregators } from "../aggregators.js";

export type DocumentWithFields<
    TSchema extends DocumentRecord,
    TFields extends
        | KeyOf<TSchema>
        | DocumentAggregators<KeyOf<TSchema>, string>,
> = {
    [key in OnlyFields<TSchema, TFields>]: TSchema[key];
} & {
    [key in OnlyAggregators<TSchema, TFields>["as"]]: number;
};

export type OnlyFields<
    TSchema extends DocumentRecord,
    TFields extends
        | KeyOf<TSchema>
        | DocumentAggregators<KeyOf<TSchema>, string>,
> = Exclude<TFields, DocumentAggregators<KeyOf<TSchema>, string>>;

export type OnlyAggregators<
    TSchema extends DocumentRecord,
    TFields extends
        | KeyOf<TSchema>
        | DocumentAggregators<KeyOf<TSchema>, string>,
> = Extract<TFields, DocumentAggregators<KeyOf<TSchema>, string>>;
