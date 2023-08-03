import { Result } from "@ulthar/immuty";
import { EntitySchema } from "../schema/entity-schema.js";
import { StoreSchema } from "../schema/store-schema.js";
import { TypeModifiers } from "../schema/type-modifiers.js";
import { Types } from "../schema/types.js";
import { InMemoryStore } from "./in-memory-store.js";

describe("In Memory Store", () => {
    test("create a simple store from a schema and insert a value", async () => {
        const schema = new StoreSchema({
            TestTable: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
            }),
        });

        const store = new InMemoryStore(schema);

        const insertEffect = store.insertInto("TestTable").values({
            id: "123",
            name: "Test",
        });

        const result = await insertEffect.run();

        expect(result).toEqual(Result.ok(undefined));
    });

    test("create a simple store from a schema and query a value", async () => {
        const schema = new StoreSchema({
            TestTable: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
            }),
        });

        const store = new InMemoryStore(schema);

        const insertEffect = store.insertInto("TestTable");

        await insertEffect
            .values([
                {
                    id: "123",
                    name: "Test",
                },
                {
                    id: "456",
                    name: "AnotherTest",
                },
            ])
            .run();

        const queryEffect = store.queryFrom("TestTable").select(["name"]);

        const result = await queryEffect.run();

        expect(result).toEqual(
            Result.ok([
                {
                    name: "Test",
                },
                {
                    name: "AnotherTest",
                },
            ])
        );
    });

    test("simple query with 'where' filtering", async () => {
        const schema = new StoreSchema({
            TestTable: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
            }),
        });

        const store = new InMemoryStore(schema);

        const insertEffect = store.insertInto("TestTable");

        await insertEffect
            .values([
                {
                    id: "123",
                    name: "Test",
                },
                {
                    id: "456",
                    name: "AnotherTest",
                },
            ])
            .run();

        const queryEffect = store
            .queryFrom("TestTable")
            .where({
                id: "123",
            })
            .select(["name"]);

        const result = await queryEffect.run();

        expect(result).toEqual(
            Result.ok([
                {
                    name: "Test",
                },
            ])
        );
    });

    test("simple query with 'limit' filtering", async () => {
        const schema = new StoreSchema({
            TestTable: new EntitySchema({
                id: TypeModifiers.PRIMARY_KEY(Types.UUID()),
                name: Types.STRING(),
            }),
        });

        const store = new InMemoryStore(schema);

        const insertEffect = store.insertInto("TestTable");

        await insertEffect
            .values([
                {
                    id: "123",
                    name: "Test",
                },
                {
                    id: "456",
                    name: "AnotherTest",
                },
            ])
            .run();

        const queryEffect = store
            .queryFrom("TestTable")
            .limit(1, 1)
            .select(["name"]);

        const result = await queryEffect.run();

        expect(result).toEqual(
            Result.ok([
                {
                    name: "AnotherTest",
                },
            ])
        );
    });
});
