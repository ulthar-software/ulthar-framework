/**
 * Interface for an observable value wrapper
 */
export interface Observable<T> {
    /**
     * The current value, maybe null
     */
    get current(): T | null;

    /**
     * Subscribes the subscriber function to the observed value.
     * If the observable has a value, it triggers instantly, and
     * for any subsequent value change.
     * Call the returned function to unsubscribe from the event stream.
     *
     * @param cb subscriber function
     */
    subscribe(cb: (value: T) => void | Promise<void>): () => void;

    /**
     * Subscribes the subscriber function to any change on the
     * observed value
     *
     * @param cb subscriber function
     * @returns unsubscribe function
     */
    onChange(cb: (value: T) => void | Promise<void>): () => void;
}
