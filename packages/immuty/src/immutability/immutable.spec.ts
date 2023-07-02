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
        const thing: Immutable<Thing> = {
            id: "1",
            name: "thing",
            someFunction: () => ({
                id: "1",
                name: "thing",
            }),
        };

        //thing.id = "2"; //should throw
        //thing.name = "thing2"; //should throw

        thing.someFunction(); //should not throw
    });
});
