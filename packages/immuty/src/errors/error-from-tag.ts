import { Error } from "./error.js";

/* prettier-ignore */
export type ErrorFromTag <
    E extends Error, 
    K extends E["_tag"]
> = E extends { readonly _tag: K; } ? E : 
    never;
