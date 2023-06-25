import { Inmutable } from "../types/inmutable.js";

export type EventListener<T> = (value: Inmutable<T>) => void | Promise<void>;
