import { Maybe } from "./maybe.js";

export type SafeResult<T> = [Maybe<T>, Maybe<Error>];
