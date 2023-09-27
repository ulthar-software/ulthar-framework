import { Result } from "../index.js";
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
            Foo: Result.wrap((foo: Foo) => foo.foo),
            "*": Result.wrap(() => "bar or fez"),
        };

        expect(
            fullMatch(
                {
                    _tag: "Foo",
                    foo: "foo",
                } as FooBar,
                matcher
            )
        ).toEqual(Result.ok("foo"));
        expect(
            fullMatch(
                {
                    _tag: "Bar",
                    bar: 99,
                } as FooBar,
                matcher
            )
        ).toEqual(Result.ok("bar or fez"));
    });
});
