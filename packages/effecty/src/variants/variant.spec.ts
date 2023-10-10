import { DefaultVariant, Result, resultify } from "../index.js";
import { fullMatch } from "./match.js";
import { TaggedVariant } from "./tagged-variant.js";

describe("Variant", () => {
    test("given a variant type, we should properly match it against a pattern matcher", () => {
        interface Foo extends TaggedVariant {
            readonly _tag: "Foo";
            readonly foo: string;
        }

        interface Bar extends TaggedVariant {
            readonly _tag: "Bar";
            readonly bar: number;
        }
        interface Fez extends TaggedVariant {
            readonly _tag: "Fez";
            readonly fez: number;
        }

        type FooBar = Foo | Bar | Fez;

        const matcher = {
            Foo: (foo: Foo) => foo.foo,
            [DefaultVariant]: () => "bar or fez",
        };

        expect(
            fullMatch(
                {
                    _tag: "Foo",
                    foo: "foo",
                } as FooBar,
                matcher
            )
        ).toEqual("foo");
        expect(
            fullMatch(
                {
                    _tag: "Bar",
                    bar: 99,
                } as FooBar,
                matcher
            )
        ).toEqual("bar or fez");
    });
});
