import { Schema } from "./schema.js";
import { SchemaTypes } from "./schema/schema-types.js";

describe("Schema", () => {
    test("create a simple schema", () => {
        type User = {
            id: string;
            name: string;
            dateOfBirth: Date;
        };

        const schema = new Schema<{
            users: User;
        }>({
            users: {
                id: SchemaTypes.UUID(),
                name: SchemaTypes.STRING(),
                dateOfBirth: SchemaTypes.STRING(),
            },
        });

        const keys = schema.getDocumentNames();

        expect(keys).toEqual(["users"]);
    });
});
