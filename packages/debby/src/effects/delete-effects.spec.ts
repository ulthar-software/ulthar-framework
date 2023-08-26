import { PosixDate } from "@ulthar/immuty";
import { IStoreDriver } from "../store-driver.js";
import { Store } from "../store.js";
import { Op } from "../operators.js";

describe("Delete effects", () => {
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

    test("Delete a value from a model collection", async () => {
        const driver = {
            delete: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store.deleteFrom("users").where({
            id: Op.Equals("1"),
        });

        expect(driver.delete).toHaveBeenCalledWith({
            from: "users",
            where: [
                {
                    id: Op.Equals("1"),
                },
            ],
        });
    });

    test("Delete all values from a model collection", async () => {
        const driver = {
            delete: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store.deleteFrom("users").all();

        expect(driver.delete).toHaveBeenCalledWith({
            from: "users",
        });
    });
});
