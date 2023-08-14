import { IStore } from "../store.js";
import { use } from "../query-interface.js";

describe("From Effect", () => {
    type User = {
        id: string;
        name: string;
        dateOfBirth: Date;
        bff: string;
    };

    type Model = {
        users: User;
    };

    test("select all from a model collection", () => {
        const store = {
            selectAll: jest.fn(),
        } as unknown as IStore<Model, never, never, never>;

        use(store).from("users").selectAll();

        expect(store.selectAll).toHaveBeenCalledWith({
            from: "users",
        });
    });

    test("select some fields from a model collection", async () => {
        const store = {
            selectSome: jest.fn(),
        } as unknown as IStore<Model, never, never, never>;

        use(store).from("users").select(["id", "name"]);

        expect(store.selectSome).toHaveBeenCalledWith({
            from: "users",
            select: {
                users: ["id", "name"],
            },
        });
    });

    test("left join two model collections", async () => {
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
});
