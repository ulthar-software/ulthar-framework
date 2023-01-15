export type EventListener<T> = (value: T) => void | Promise<void>;
