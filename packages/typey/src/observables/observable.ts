export interface Observable<T> {
    get current(): T | null;
    subscribe(cb: (value: T) => void | Promise<void>): () => void;
    onChange(cb: (value: T) => void | Promise<void>): () => void;
}
