import { DocumentRecord, KeyOf } from "@ulthar/immuty";
import { DocumentSchema, DocumentSchemaMap } from "./schema/document-schema.js";

export class Schema<TSchema extends Record<string, DocumentRecord>> {
    constructor(private readonly schema: DocumentSchemaMap<TSchema>) {}

    public getDocumentNames(): KeyOf<TSchema>[] {
        return Object.keys(this.schema);
    }

    public getDocumentSchema<TKey extends KeyOf<TSchema>>(
        key: TKey
    ): DocumentSchema<TSchema, TSchema[TKey]> {
        return this.schema[key];
    }
}
