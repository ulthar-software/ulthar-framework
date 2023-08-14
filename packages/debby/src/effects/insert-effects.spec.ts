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
});
