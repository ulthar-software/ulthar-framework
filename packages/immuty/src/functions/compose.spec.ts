import { compose } from "./compose.js";
import { identity } from "./identity.js";

describe("composition function", () => {
    it("should compose two functions", () => {
        const f = (x: number) => x + 1;
        const g = (x: number) => x * 2;
        expect(compose(f, g)(1)).toEqual(4);
    });

    it("should respect identity", () => {
        const f = (x: number) => x + 1;
        expect(compose(f, identity)(1)).toEqual(f(1));
        expect(compose(identity<number>, f)(1)).toEqual(f(1));
    });
});
