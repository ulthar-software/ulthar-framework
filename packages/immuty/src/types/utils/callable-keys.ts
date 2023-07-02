import { SomeFunction } from "../../functions/function.js";
import { KeysMatching } from "./keys-matching.js";

export type CallableKeys<T> = KeysMatching<T, SomeFunction>;
