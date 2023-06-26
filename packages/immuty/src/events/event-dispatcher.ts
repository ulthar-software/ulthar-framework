import { Immutable } from "../immutable/index.js";
import { EventListener } from "./event-listener.js";

/**
 * Handler for pub/sub of events
 * It triggers values in a single channel through the `subscribe` method.
 **/
export class EventDispatcher<T> {
    private listeners: EventListener<T>[] = [];

    /**
     * Trigger an event notification to all subscribers
     * @param value Event Value
     */
    dispatch(value: Immutable<T>) {
        this.listeners.forEach((cb) => {
            cb(value);
        });
    }
    /**
     * Subscribe to the event stream.
     * Call the returned function to unsubscribe from the stream
     *
     * @param listener eventListener
     * @returns unsubscribe function
     */
    subscribe(listener: EventListener<T>) {
        this.listeners = [...this.listeners, listener];
        return () => {
            this.listeners = this.listeners.toSpliced(
                this.listeners.indexOf(listener),
                1
            );
        };
    }
}
