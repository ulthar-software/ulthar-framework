import { IStoreDriver } from "../store-driver.js";
import { Store } from "../store.js";
import { PosixDate } from "@ulthar/immuty";

describe("Insert Effects", () => {
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
        const driver = {
            insert: jest.fn(),
        } as unknown as IStoreDriver<Model>;
        const store = new Store(driver);

        store.insertInto("users").values([
            {
                id: "1",
                name: "John",
                dateOfBirth: PosixDate.now(),
                bff: "2",
            },
        ]);

        expect(driver.insert).toHaveBeenCalledWith({
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
});
