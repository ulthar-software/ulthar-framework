import { AnyFunction } from "../functions.js";
import { KeysMatching } from "./keys-matching.js";

export type CallableKeys<T> = KeysMatching<T, AnyFunction>;
