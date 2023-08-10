import { KeyOf } from "@ulthar/immuty";
import { DocumentSchemaMap } from "./schema/document-schema.js";
import { Document } from "./types/document.js";

export class Schema<TSchema extends Record<string, Document>> {
    constructor(private readonly schema: DocumentSchemaMap<TSchema>) {}

    public getDocumentNames(): KeyOf<TSchema>[] {
        return Object.keys(this.schema);
    }
}
