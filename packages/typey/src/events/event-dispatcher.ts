import { EventListener } from "./event-listener.js";

export class EventDispatcher<T> {
    private listeners: EventListener<T>[] = [];
    dispatch(value: T) {
        this.listeners.forEach((cb) => {
            cb(value);
        });
    }
    subscribe(listener: EventListener<T>) {
        this.listeners.push(listener);
        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        };
    }
}
