import { PosixDate } from "@ulthar/effecty";
import { IStoreDriver } from "../store-driver.js";
import { Store } from "../store.js";
import { Op } from "../operators.js";

describe("Update Effects", () => {
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

    test("Update values in a model collection", () => {
        const driver = {
            update: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store.update("users").setAll({
            name: "John",
        });

        expect(driver.update).toHaveBeenCalledWith({
            from: "users",
            set: {
                name: "John",
            },
        });
    });

    test("Update values in a model collection with a where clause", () => {
        const driver = {
            update: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store
            .update("users")
            .where({
                id: Op.Equals("1"),
            })
            .set({
                name: "John",
            });

        expect(driver.update).toHaveBeenCalledWith({
            from: "users",
            where: [
                {
                    id: {
                        eq: "1",
                    },
                },
            ],
            set: {
                name: "John",
            },
        });
    });
});
