import { Immutable } from "../immutable/index.js";

export type EventListener<T> = (value: Immutable<T>) => void | Promise<void>;
