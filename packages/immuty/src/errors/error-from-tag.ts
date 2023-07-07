import { TaggedError } from "./error.js";

/* prettier-ignore */
export type ErrorFromTag <
    E extends TaggedError, 
    K extends E["_tag"]
> = E extends { readonly _tag: K; } ? E : 
    never;
