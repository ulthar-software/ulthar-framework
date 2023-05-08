import { Maybe } from "./maybe.js";

describe("Maybe", () => {
    test("Given a value, create a maybe of it and be able to pattern match", () => {
        const maybeValue = Maybe.of(1);
        maybeValue.match({
            just: (value) => expect(value).toBe(1),
            none: () => fail("Should not be none"),
        });
    });

    test("Given a null value, create a maybe of it and be able to pattern match", () => {
        const noneResult = Maybe.none();
        noneResult.match({
            just: (value) => fail("Should not be a value"),
            none: () => expect(true).toBe(true),
        });
    });
});
