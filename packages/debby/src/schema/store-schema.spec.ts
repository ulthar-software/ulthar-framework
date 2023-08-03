import { EntitySchema } from "./entity-schema.js";
import { StoreSchema } from "./store-schema.js";
import { TypeModifiers } from "./type-modifiers.js";
import { Types } from "./types.js";

describe("Store Schema", () => {
    test("create a simple schema", () => {
        const schema = new StoreSchema({
            TestTable: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
            }),
        });

        expect(schema.getTableNames()).toEqual(["TestTable"]);
    });

    test("create a schema with references between entities", () => {
        const schema = new StoreSchema({
            TestTable: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
            }),
            TestTable2: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
                testTableId: Types.REFERENCE("TestTable"),
            }),
        });

        expect(schema.getTableNames()).toEqual(["TestTable", "TestTable2"]);
    });
});
