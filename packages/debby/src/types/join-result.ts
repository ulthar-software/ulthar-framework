import { Document } from "./document.js";

export type JoinResult<
    TSchema extends Document = Document,
    TName extends string = string,
> = {
    [K in TName]: TSchema;
};
