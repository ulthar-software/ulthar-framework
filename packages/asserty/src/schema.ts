import { SomeRecord, KeyOf } from "@ulthar/effecty";
import { RecordsSchema, RecordsSchemaMap } from "./schema/document-schema.js";

export class Schema<TSchema extends Record<string, SomeRecord>> {
    constructor(private readonly schema: RecordsSchemaMap<TSchema>) {}

    public getDocumentNames(): KeyOf<TSchema>[] {
        return Object.keys(this.schema);
    }

    public getDocumentSchema<TKey extends KeyOf<TSchema>>(
        key: TKey
    ): RecordsSchema<TSchema, TSchema[TKey]> {
        return this.schema[key];
    }
}
