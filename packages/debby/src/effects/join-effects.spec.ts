import { Store } from "../store.js";
import { PosixDate } from "@ulthar/effecty";
import { IStoreDriver } from "../store-driver.js";

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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .leftJoin("users", { as: "bff" })
            .on({
                users: "bff",
                bff: "id",
            })
            .selectAll();

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .leftJoin("posts", { as: "posts" })
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
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

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .rightJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .innerJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .fullJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .selectAll();

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
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

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
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

        expect(driver.select).toHaveBeenCalledWith({
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
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
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

        expect(driver.select).toHaveBeenCalledWith({
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
