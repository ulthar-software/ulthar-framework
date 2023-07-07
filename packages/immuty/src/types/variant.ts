import { Fn } from "../functions/unary.js";

/**
 * A variant type is a type that can be one of a set of types.
 * It represents a pattern matchable construct in the type system.
 */
export interface Variant {
    readonly _tag: string;
}

/**
 * TypeFromTag allows the extraction of a specific variant type
 * given a tag.
 */
export type TypeFromTag<A extends Variant, K extends string> = A extends {
    readonly _tag: K;
}
    ? A
    : never;

/**
 * A pattern matcher is a map from variant tags to functions
 * that handle the specific variant.
 */
export type PatternMatcher<A extends Variant, B> = {
    [K in A["_tag"]]: Fn<TypeFromTag<A, K>, B>;
};

export type ReturnTypesOf<T> = {
    [K in keyof T]: T[K] extends Fn<any, infer R> ? R : never;
}[keyof T];

/**
 * Match a variant value against a pattern matcher and return
 * the value of the matching function.
 *
 * @param value The variant value to match.
 * @param cases The pattern matcher to match against.
 * @returns The result of the matching function.
 */
export function match<A extends Variant, PM extends PatternMatcher<A, any>>(
    value: A,
    cases: PM
): ReturnTypesOf<PM> {
    return cases[value._tag as A["_tag"]](value as TypeFromTag<A, A["_tag"]>);
}
