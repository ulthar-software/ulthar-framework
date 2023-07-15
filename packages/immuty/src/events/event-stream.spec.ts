import { Fn, MaybePromise, Result } from "../index.js";
import { EventStream } from "./event-stream.js";

describe("Event Source", () => {
    class DummyEventTarget<T> {
        private listeners = new Set<Fn<T, MaybePromise<void>>>();

        addEventListener(callback: Fn<T, MaybePromise<void>>): void {
            if (callback) {
                this.listeners.add(callback);
            }
        }
        dispatchEvent(event: T): boolean {
            this.listeners.forEach((listener) => {
                listener(event);
            });
            return true;
        }
        removeEventListener(callback: Fn<T, MaybePromise<void>>): void {
            this.listeners.delete(callback);
        }
    }

    it("should be able to create an event source from a function", () => {
        const eventDispatcher = new DummyEventTarget<number>();

        const updateFn = jest.fn();
        const onCloseFn = jest.fn();

        const source = EventStream.closableFrom<number, never>(
            ({ emit: update, onClose }) => {
                const cb = (data: number) => {
                    update(Result.ok(data));
                };
                eventDispatcher.addEventListener(cb);
                onClose(() => {
                    onCloseFn();
                    eventDispatcher.removeEventListener(cb);
                });
            }
        );
        expect(source).toBeDefined();
        source.subscribe(updateFn);

        eventDispatcher.dispatchEvent(1);
        eventDispatcher.dispatchEvent(2);
        eventDispatcher.dispatchEvent(3);

        source.close();

        eventDispatcher.dispatchEvent(4);

        expect(updateFn).toBeCalledTimes(3);
        expect(onCloseFn).toBeCalledTimes(1);
    });
});
