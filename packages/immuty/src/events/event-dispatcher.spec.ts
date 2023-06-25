import { EventDispatcher } from "./event-dispatcher";

describe("Event Dispatcher", () => {
    it("should register listeners, dispatch events and unsubscribe successfully", () => {
        const evtDispatcher = new EventDispatcher<string>();

        const fn = jest.fn();

        const unSub = evtDispatcher.subscribe(fn);

        evtDispatcher.dispatch("hello");
        expect(fn).toHaveBeenCalledWith("hello");

        evtDispatcher.dispatch("world");
        expect(fn).toHaveBeenCalledWith("world");

        unSub();

        evtDispatcher.dispatch("banana");
        expect(fn).not.toHaveBeenCalledWith("banana");
    });
});
