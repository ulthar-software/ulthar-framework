import { Result } from "@ulthar/immuty";
import { Schema } from "../schema.js";
import { SchemaTypes } from "../schema/schema-types.js";
import { InMemoryStore } from "./in-memory-store.js";

describe("In Memory Store implementation", () => {
    test("creating a store", async () => {
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

        const store = InMemoryStore.fromSchema(schema);

        await store
            .insertInto("users")
            .values([
                {
                    id: "1",
                    name: "John Doe",
                    dateOfBirth: new Date("1990-01-01"),
                },
            ])
            .run();

        const users = await store.from("users").selectAll().run();

        expect(users).toEqual(
            Result.ok([
                {
                    id: "1",
                    name: "John Doe",
                    dateOfBirth: new Date("1990-01-01"),
                },
            ])
        );
    });

    test.skip("join two documents", async () => {
        type User = {
            id: string;
            name: string;
            dateOfBirth: Date;
        };

        type Post = {
            id: string;
            title: string;
            content: string;
            authorId: string;
        };

        const schema = new Schema<{
            users: User;
            posts: Post;
        }>({
            users: {
                id: SchemaTypes.UUID(),
                name: SchemaTypes.STRING(),
                dateOfBirth: SchemaTypes.STRING(),
            },
            posts: {
                id: SchemaTypes.UUID(),
                title: SchemaTypes.STRING(),
                content: SchemaTypes.STRING(),
                authorId: SchemaTypes.REFERENCE("users"),
            },
        });

        const store = InMemoryStore.fromSchema(schema);

        await store
            .insertInto("users")
            .values([
                {
                    id: "1",
                    name: "John Doe",
                    dateOfBirth: new Date("1990-01-01"),
                },
            ])
            .run();

        await store
            .insertInto("posts")
            .values([
                {
                    id: "1",
                    title: "Hello World",
                    content: "This is my first post",
                    authorId: "1",
                },
            ])
            .run();

        const posts = await store
            .from("posts")
            .leftJoin("users")
            .on({
                posts: "authorId",
                users: "id",
            })
            .selectAll()
            .run();

        expect(posts).toEqual(
            Result.ok([
                {
                    posts: {
                        id: "1",
                        title: "Hello World",
                        content: "This is my first post",
                    },
                    users: {
                        id: "1",
                        name: "John Doe",
                        dateOfBirth: new Date("1990-01-01"),
                    },
                },
            ])
        );
    });
});
