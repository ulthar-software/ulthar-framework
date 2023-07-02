import { Immutable } from "../immutability/index.js";

export type EventListener<T> = (value: Immutable<T>) => void | Promise<void>;
