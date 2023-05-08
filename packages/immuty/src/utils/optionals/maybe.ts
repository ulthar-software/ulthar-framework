export class Maybe<T> {
    static none() {
        return new Maybe();
    }
    static of<T>(value: T) {
        return new Maybe(value);
    }

    private constructor(private value?: T) {}

    match(matcher: MaybePatternMatcher<T>) {
        if (this.value) matcher.just(this.value);
        else matcher.none();
    }
}

interface MaybePatternMatcher<T> {
    just: (value: T) => void;
    none: () => void;
}
