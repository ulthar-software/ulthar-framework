import { FilterMatching } from "./filter-matching.js";
import { AnyFunction } from "./function.js";

export type MethodsOf<T> = FilterMatching<T, AnyFunction>;

//playground

interface X {
    someString: string;
    someCallable: (foo: string) => boolean;
}

type F = MethodsOf<X>;
