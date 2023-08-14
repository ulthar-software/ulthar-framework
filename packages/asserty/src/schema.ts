import { DocumentRecord, KeyOf } from "@ulthar/immuty";
import { DocumentSchemaMap } from "./schema/document-schema.js";

export class Schema<TSchema extends Record<string, DocumentRecord>> {
    constructor(private readonly schema: DocumentSchemaMap<TSchema>) {}

    public getDocumentNames(): KeyOf<TSchema>[] {
        return Object.keys(this.schema);
    }
}
