import { Fn, MaybePromise, Result, TaggedError } from "../index.js";
import { EventStreamSubject } from "./event-stream-subject.js";

export type HandlerFn<A> = (a: A) => MaybePromise<void>;

export type IEventSource<A, AErr extends TaggedError> = AsyncIterable<
    Result<A, AErr>
>;

export interface IEventStream<A, AErr extends TaggedError>
    extends IEventSource<A, AErr> {
    subscribe(
        handler: HandlerFn<Result<A, AErr>>,
        onClose?: HandlerFn<void>
    ): () => void;
}

export interface IClosableEventStream<A, AErr extends TaggedError>
    extends IEventStream<A, AErr> {
    close(): void;
}

export interface IEventStreamSubject<A, AErr extends TaggedError>
    extends IClosableEventStream<A, AErr> {
    emit(result: Result<A, AErr>): void;
    emitAndClose(result: Result<A, AErr>): void;
}

export interface FromOptions<A, AErr extends TaggedError> {
    emit: Fn<Result<A, AErr>, void>;
    onClose: Fn<HandlerFn<void>, void>;
}

export namespace EventStream {
    export function closableFrom<A, AErr extends TaggedError>(
        f: HandlerFn<FromOptions<A, AErr>>
    ): IClosableEventStream<A, AErr> {
        const subject = new EventStreamSubject<A, AErr>();
        void f({
            emit: (result) => {
                subject.emit(result);
            },
            onClose: (cb) => {
                subject.onClose(cb);
            },
        });
        return subject;
    }
}
