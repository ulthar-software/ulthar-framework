import { TaggedError } from "@ulthar/effecty";

export function createTaggedError<
    TTag extends string,
    TParams extends Record<string, unknown> = Record<string, never>,
    TArgs extends unknown[] = [],
>(
    tag: TTag,
    paramFn?: (...args: TArgs) => TParams,
    toString?: (params: TParams) => string
) {
    return class CustomTaggedError extends TaggedError<TTag> {
        public params: TParams;
        constructor(...args: TArgs) {
            super(tag);
            this.params = paramFn?.(...args) ?? ({} as TParams);
        }
        toString() {
            return (
                toString?.(this.params) ??
                `${tag}: ${JSON.stringify(this.params)}`
            );
        }
    };
}
