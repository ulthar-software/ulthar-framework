import { Fn, MaybePromise, Result, TaggedError } from "../index.js";
import { Maybe } from "../types/maybe.js";
import { IEventStreamSubject } from "./event-stream.js";

type UnSubscriptionFn = () => void;

export class EventStreamSubject<A, AErr extends TaggedError>
    implements IEventStreamSubject<A, AErr>
{
    private _current: Maybe<Result<A, AErr>>;
    private done = false;

    private _listeners = new Set<Fn<[Result<A, AErr>], MaybePromise<void>>>();

    private _onClose = new Set<Fn<[void], MaybePromise<void>>>();

    constructor(initial?: Result<A, AErr>) {
        this._current = initial;
    }

    get isDone() {
        return this.done;
    }

    emit(result: Result<A, AErr>) {
        if (this.done) {
            return;
        }
        this._current = result;
        for (const listener of this._listeners) {
            void listener(result);
        }
    }

    emitAndClose(result: Result<A, AErr>) {
        if (this.done) {
            return;
        }
        this.emit(result);
        this.close();
    }

    subscribe(
        subscriber: (result: Result<A, AErr>) => MaybePromise<void>,
        onClose?: () => MaybePromise<void>
    ): UnSubscriptionFn {
        if (this.done) {
            throw new Error("Cannot subscribe to a closed event stream");
        }
        this._listeners.add(subscriber);
        if (this._current) {
            void subscriber(this._current);
        }
        if (onClose) {
            this._onClose.add(onClose);
        }
        return () => this._listeners.delete(subscriber);
    }

    onClose(closeCallback: Fn<[void], MaybePromise<void>>) {
        this._onClose.add(closeCallback);
    }

    close() {
        if (this.done) {
            return;
        }

        this._listeners.clear();
        this.done = true;

        this._onClose.forEach((cb) => {
            void cb();
        });
        this._onClose.clear();
    }

    async next(): Promise<IteratorResult<Result<A, AErr>>> {
        if (this.done) {
            return { done: true, value: this._current };
        }
        return new Promise((resolve) => {
            const listener = (result: Result<A, AErr>) => {
                this._listeners.delete(listener);
                resolve({ done: false, value: result });
            };
            this._listeners.add(listener);
            this._onClose.add(() => {
                this._listeners.delete(listener);
                resolve({ done: true, value: this._current });
            });
        });
    }

    [Symbol.asyncIterator](): AsyncIterator<Result<A, AErr>> {
        return this;
    }
}
