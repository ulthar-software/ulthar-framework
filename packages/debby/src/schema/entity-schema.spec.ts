import { EntitySchema } from "./entity-schema.js";
import { TypeModifiers } from "./type-modifiers.js";
import { Types } from "./types.js";

describe("Entity Schema", () => {
    test("create a simple schema", () => {
        const schema = new EntitySchema({
            id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
            name: Types.STRING(),
        });

        const entity = schema.createEntity({
            id: "123",
            name: "Test",
        });

        expect(entity).toEqual({
            id: "123",
            name: "Test",
        });
    });

    test("create a schema with references between entities", () => {
        const schema = new EntitySchema({
            id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
            name: Types.STRING(),
            testTableId: Types.REFERENCE("TestTable"),
        });

        const entity = schema.createEntity({
            id: "123",
            name: "Test",
            testTableId: "456",
        });

        expect(entity).toEqual({
            id: "123",
            name: "Test",
            testTableId: "456",
        });
    });
});
