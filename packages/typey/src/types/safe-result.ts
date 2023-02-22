import { Maybe } from "./maybe";

export type SafeResult<T> = [Maybe<T>, Maybe<Error>];
