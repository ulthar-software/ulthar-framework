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
    dispatch(value: T) {
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
        this.listeners.push(listener);
        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        };
    }
}
