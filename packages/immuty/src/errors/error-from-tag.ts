import { Error, ErrorTag } from "./error.js";

/* prettier-ignore */
export type ErrorFromTag <
    E extends Error, 
    K extends E[ErrorTag]
> = E extends { readonly [ErrorTag]: K; } ? E : 
    never;
