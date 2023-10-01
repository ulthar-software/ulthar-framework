import { compose } from "./compose.js";
import { identity } from "./identity.js";

describe("composition function", () => {
    test("compose two functions", () => {
        const f = (x: number) => x + 1;
        const g = (x: number) => x * 2;
        expect(compose(f, g)(1)).toEqual(4);
    });

    test("compose an async function with a sync function", async () => {
        const f = (x: number) => x + 1;
        const g = async (x: number) => x * 2;
        expect(await compose(f, g)(1)).toEqual(4);
    });

    test("compose a sync function with an async function", async () => {
        const f = async (x: number) => x + 1;
        const g = (x: number) => x * 2;
        expect(await compose(f, g)(1)).toEqual(4);
    });

    test("compose should respect identity", () => {
        const f = (x: number) => x + 1;
        expect(compose(f, identity)(1)).toEqual(f(1));
        expect(compose(identity<number>, f)(1)).toEqual(f(1));
    });
});
