export class Result<T, const E extends string> {
    static of<T>(value: T): Result<T, never> {
        return new Result(value);
    }
    static err<const E extends string>(err: E): Result<any, E> {
        return new Result(null, err);
    }

    private constructor(private value: T, private err?: E) {}

    match(matcher: ResultPatternMatcher<T, E>): void {
        if (this.value) matcher.just(this.value);
        else matcher.err(this.err!);
    }
}

export interface ResultPatternMatcher<T, E> {
    just: (value: T) => void;
    err: (err: E) => void;
}
