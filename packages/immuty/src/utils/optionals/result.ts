export type Result<T, E> = Value<T> | Error<E>;

export interface Error<E> {
    error: E;
}

export interface Value<T> {
    value: T;
}

export const Result = {
    of<T>(value: T): Value<T> {
        return { value };
    },
    err<const E extends string>(error: E): Error<E> {
        return { error };
    },
    match<T, E>(
        result: Result<T, E>,
        matcher: ResultPatternMatcher<T, E>
    ): void {
        if (this.succeeded(result)) matcher.just(result.value);
        else matcher.err(result.error);
    },
    failed<T, E>(result: Result<T, E>): result is Error<E> {
        return (<any>result).error !== undefined;
    },
    succeeded<T, E>(result: Result<T, E>): result is Value<T> {
        return (<any>result).value !== undefined;
    },
    unwrap<T>(result: Value<T>): T {
        return result.value;
    },
    unwrapError<E>(result: Error<E>): E {
        return result.error;
    },
} as const;

export interface ResultPatternMatcher<T, E> {
    just: (value: T) => void;
    err: (err: E) => void;
}
