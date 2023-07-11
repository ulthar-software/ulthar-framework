import { match } from "./match.js";
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

        type FooBar = Foo | Bar;

        const fooBar: FooBar = {
            _tag: "Foo",
            foo: "foo",
        };

        const result = match(fooBar as FooBar, {
            Foo: (foo): string => foo.foo,
            Bar: (bar): number => bar.bar,
        });

        expect(result).toBe("foo");
    });
});
