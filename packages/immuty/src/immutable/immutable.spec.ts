import { Immutable } from "./immutable.js";

describe("Inmutable Type", () => {
    test("given a type it should return a readonly version of it", () => {
        type Thing = {
            id: string;
            name: string;
            someFunction: () => {
                id: string;
                name: string;
            };
        };
        type DeepReadonlyThing = Immutable<Thing>;
        const thing: DeepReadonlyThing = {
            id: "1",
            name: "thing",
            someFunction: () => ({
                id: "1",
                name: "thing",
            }),
        };

        // @ts-expect-error
        thing.id = "2"; //should throw

        // @ts-expect-error
        thing.name = "thing2"; //should throw

        thing.someFunction(); //should not throw
    });
});
