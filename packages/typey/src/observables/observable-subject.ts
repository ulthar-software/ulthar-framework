import { EventDispatcher } from "../events/event-dispatcher.js";
import { Observable } from "./observable.js";

/**
 * Observable that wraps a value with an interface to modify said
 * value and automatically notify subscribers
 */
export class ObservableSubject<T> implements Observable<T> {
    private _current: T | null;
    private evtDispatcher: EventDispatcher<T> = new EventDispatcher();
    get current() {
        return this._current;
    }
    constructor(value: T | null = null) {
        this._current = value;
    }

    /**
     * Updates the current value and notifies to all subscribers
     * @param value new value
     */
    update(value: T) {
        this._current = value;
        this.evtDispatcher.dispatch(this._current);
    }
    subscribe(cb: (value: T) => void | Promise<void>) {
        if (this.current) {
            cb(this.current);
        }
        return this.evtDispatcher.subscribe(cb);
    }
    onChange(cb: (value: T) => void | Promise<void>) {
        return this.evtDispatcher.subscribe(cb);
    }
}
