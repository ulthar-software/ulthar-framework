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

    test("Left join same model collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
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
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("posts", { as: "posts" })
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
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
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .leftJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
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

    test("Right join another model collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .rightJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "posts",
                    type: "right",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });

    test("Inner join another model collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .innerJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "posts",
                    type: "inner",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });

    test("Full join another model collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .fullJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
            from: "users",
            joins: [
                {
                    from: "posts",
                    type: "full",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });

    test("Right join another model collection with a join on the joined collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .rightJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
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
                {
                    from: "posts",
                    type: "right",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });

    test("Inner join another model collection with a join on the joined collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .innerJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
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
                {
                    from: "posts",
                    type: "inner",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });

    test("Full join another model collection with a join on the joined collection", async () => {
        const store = {
            select: jest.fn(),
        } as unknown as IStore<Model>;

        use(store)
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .fullJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(store.select).toHaveBeenCalledWith({
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
                {
                    from: "posts",
                    type: "full",
                    as: "posts",
                    on: {
                        users: "id",
                        posts: "authorId",
                    },
                },
            ],
        });
    });
});
