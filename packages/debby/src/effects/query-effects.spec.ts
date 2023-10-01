import { Store } from "../store.js";
import { PosixDate } from "@ulthar/effecty";
import { Op } from "../operators.js";
import { Aggregators } from "../aggregators.js";
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

    test("Select all from a model collection", () => {
        const driver = {
            select: jest.fn(),
        };

        const store = new Store(driver as unknown as IStoreDriver<Model>);

        store.from("users").selectAll();

        expect(driver.select).toHaveBeenCalledWith({
            from: "users",
        });
    });

    test("Select some fields from a model collection", async () => {
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store.from("users").select(["id", "name"]);

        expect(driver.select).toHaveBeenCalledWith({
            from: "users",
            select: {
                users: ["id", "name"],
            },
        });
    });

    test("Left join another model collection and select some fields", async () => {
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .leftJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .select({
                users: ["id", "name"],
                posts: ["id"],
            });

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
            select: {
                users: ["id", "name"],
                posts: ["id"],
            },
        });
    });

    test("filter by a field", async () => {
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .where({
                name: Op.Equals("John"),
            })
            .selectAll();

        expect(driver.select).toHaveBeenCalledWith({
            from: "users",
            where: [
                {
                    users: {
                        name: {
                            eq: "John",
                        },
                    },
                },
            ],
        });
    });

    test("join and filter by a field", async () => {
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .leftJoin("posts")
            .on({
                users: "id",
                posts: "authorId",
            })
            .where({
                users: {
                    name: Op.Equals("John"),
                },
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
            where: [
                {
                    users: {
                        name: {
                            eq: "John",
                        },
                    },
                },
            ],
        });
    });

    test("group by a field", async () => {
        const driver = {
            select: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .from("users")
            .groupBy(["dateOfBirth"])
            .select([
                Aggregators.count("id", {
                    as: "numberOfUsers",
                }),
            ]);

        expect(driver.select).toHaveBeenCalledWith({
            from: "users",
            groupBy: {
                users: ["dateOfBirth"],
            },
            select: {
                users: [],
            },
            aggregates: {
                users: [
                    {
                        count: "id",
                        as: "numberOfUsers",
                    },
                ],
            },
        });
    });
});
