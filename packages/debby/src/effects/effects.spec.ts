import { IStore } from "../store.js";
import { use } from "../query-interface.js";
import { PosixDate } from "@ulthar/immuty";

describe("Query Effects", () => {
    type User = {
        id: string;
        name: string;
        dateOfBirth: PosixDate;
        bff: string;
    };

    type Post = {
        id: string;
        title: string;
        content: string;
        authorId: string;
    };

    type Model = {
        users: User;
        posts: Post;
    };

    test("Insert values into a model collection", () => {
        const store = {
            insert: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .insertInto("users")
            .values([
                {
                    id: "1",
                    name: "John",
                    dateOfBirth: PosixDate.now(),
                    bff: "2",
                },
            ]);

        expect(store.insert).toHaveBeenCalledWith({
            into: "users",
            values: [
                {
                    id: "1",
                    name: "John",
                    dateOfBirth: expect.any(PosixDate),
                    bff: "2",
                },
            ],
        });
    });

    test("Select all from a model collection", () => {
        const store = {
            selectAll: jest.fn(),
        } as unknown as IStore<Model>;

        use(store).from("users").selectAll();

        expect(store.selectAll).toHaveBeenCalledWith({
            from: "users",
        });
    });

    test("Select some fields from a model collection", async () => {
        const store = {
            selectSome: jest.fn(),
        } as unknown as IStore<Model>;

        use(store).from("users").select(["id", "name"]);

        expect(store.selectSome).toHaveBeenCalledWith({
            from: "users",
            select: {
                users: ["id", "name"],
            },
        });
    });

    test("Left join same model collection", async () => {
        const store = {
            selectAllWithJoins: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .selectAll();

        expect(store.selectAllWithJoins).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "users",
                    type: "left",
                    as: "bff",
                    on: {
                        users: "bff",
                        bff: "id",
                    },
                },
            ],
        });
    });

    test("Left join another model collection", async () => {
        const store = {
            selectAllWithJoins: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("posts", { as: "posts" })
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.selectAllWithJoins).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "posts",
                    type: "left",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });

    test("Left join another model collection with a join on the joined collection", async () => {
        const store = {
            selectAllWithJoins: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .selectAll();

        expect(store.selectAllWithJoins).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "posts",
                    type: "left",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
                {
                    from: "users",
                    type: "left",
                    as: "bff",
                    on: {
                        users: "bff",
                        bff: "id",
                    },
                },
            ],
        });
    });

    test("Left join another model collection and select some fields", async () => {
        const store = {
            selectSomeWithJoins: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("posts", { as: "posts" })
            .on({
                users: "id",
                posts: "authorId",
            })
            .select({
                users: ["id", "name"],
                posts: ["id"],
            });

        expect(store.selectSomeWithJoins).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "posts",
                    type: "left",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
            select: {
                users: ["id", "name"],
                posts: ["id"],
            },
        });
    });
});
