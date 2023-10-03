import { TaggedError } from "./tagged-error.js";

export function customTaggedError<
    TTag extends string,
    TParams extends Record<string, unknown> = Record<string, never>,
    TArgs extends unknown[] = [],
>(
    tag: TTag,
    paramFn?: (...args: TArgs) => TParams,
    customToString?: (params: TParams) => string
) {
    return class CustomTaggedError extends TaggedError<TTag> {
        public params: TParams;
        constructor(...args: TArgs) {
            super(tag);
            this.params = paramFn?.(...args) ?? ({} as TParams);
        }
        toString() {
            if (customToString) {
                return `[${this._tag}] ${customToString(this.params)}`;
            }

            return super.toString(this.params);
        }
    };
}
