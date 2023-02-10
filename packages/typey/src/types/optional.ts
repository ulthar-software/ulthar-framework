import { Maybe } from "./maybe";

export type Optional<T> = [Maybe<T>, Maybe<Error>];
