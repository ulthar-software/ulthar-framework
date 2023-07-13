import { fullMatch } from "./match.js";
import { Variant } from "./variant.js";

describe("Variant", () => {
    test("given a variant type, we should properly match it against a pattern matcher", () => {
        interface Foo extends Variant {
            readonly _tag: "Foo";
            readonly foo: string;
        }

        interface Bar extends Variant {
            readonly _tag: "Bar";
            readonly bar: number;
        }
        interface Fez extends Variant {
            readonly _tag: "Fez";
            readonly fez: number;
        }

        type FooBar = Foo | Bar | Fez;

        const matcher = {
            Foo: (foo: Foo): string => foo.foo,
            "*": (): number => 5,
        };

        expect(
            fullMatch(
                {
                    _tag: "Foo",
                    foo: "foo",
                } as FooBar,
                matcher
            )
        ).toBe("foo");
        expect(
            fullMatch(
                {
                    _tag: "Bar",
                    bar: 99,
                } as FooBar,
                matcher
            )
        ).toBe(5);
    });
});
