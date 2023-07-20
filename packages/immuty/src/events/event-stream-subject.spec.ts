import { Result, TimeSpan } from "../index.js";
import { EventStreamSubject } from "./event-stream-subject.js";

describe("Event Stream Subject", () => {
    it("should be able to create an event stream subject", () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();
        const onCloseFn = jest.fn();
        const unsubscribe = subject.subscribe(clientUpdateFn, onCloseFn);

        subject.emit(Result.ok(1));
        subject.emit(Result.ok(2));
        subject.emit(Result.ok(3));

        unsubscribe();

        subject.emit(Result.ok(3));

        subject.close();

        expect(clientUpdateFn).toBeCalledTimes(3);
        expect(onCloseFn).toBeCalledTimes(1);

        expect(subject.isDone).toBe(true);
    });

    it("should not update listeners after close", () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();
        const onCloseFn = jest.fn();
        subject.subscribe(clientUpdateFn, onCloseFn);

        subject.emit(Result.ok(1));
        subject.close();
        subject.emit(Result.ok(2));

        expect(clientUpdateFn).toBeCalledTimes(1);
        expect(onCloseFn).toBeCalledTimes(1);
    });

    it("should be able to update and close in one call", () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();
        const onCloseFn = jest.fn();
        subject.subscribe(clientUpdateFn, onCloseFn);

        subject.emitAndClose(Result.ok(1));

        expect(clientUpdateFn).toBeCalledTimes(1);
        expect(onCloseFn).toBeCalledTimes(1);
    });

    it("should trigger subscriber instantly if there is already a value in the subject", () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();
        const onCloseFn = jest.fn();
        subject.emit(Result.ok(1));

        subject.subscribe(clientUpdateFn, onCloseFn);

        subject.emitAndClose(Result.ok(1));

        expect(clientUpdateFn).toBeCalledTimes(2);
        expect(onCloseFn).toBeCalledTimes(1);
    });

    it("should be able to be used in a for await loop", async () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();

        setImmediate(async () => {
            await TimeSpan.milliseconds(200).sleep();
            subject.emit(Result.ok(1));
            await TimeSpan.milliseconds(200).sleep();
            subject.emit(Result.ok(2));
            await TimeSpan.milliseconds(200).sleep();
            subject.emit(Result.ok(3));
            await TimeSpan.milliseconds(200).sleep();
            subject.close();
        });

        for await (const value of subject) {
            clientUpdateFn(value);
        }

        expect(clientUpdateFn).toBeCalledTimes(3);
    });

    it("should finish a for await loop if the subject is already closed", async () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();

        subject.close();

        for await (const value of subject) {
            clientUpdateFn(value);
        }

        expect(clientUpdateFn).toBeCalledTimes(0);
    });

    it("should not be able to close or update after a close", () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();
        const onCloseFn = jest.fn();
        subject.subscribe(clientUpdateFn, onCloseFn);

        subject.emit(Result.ok(1));
        subject.close();
        subject.emit(Result.ok(2));
        subject.emitAndClose(Result.ok(1));
        subject.close();

        expect(clientUpdateFn).toBeCalledTimes(1);
        expect(onCloseFn).toBeCalledTimes(1);
    });

    it("should not be able to subscribe after a close", () => {
        const subject = new EventStreamSubject<number, never>();
        const clientUpdateFn = jest.fn();
        const onCloseFn = jest.fn();
        subject.onClose(onCloseFn);
        subject.close();

        expect(() => subject.subscribe(clientUpdateFn)).toThrowError();

        expect(clientUpdateFn).toBeCalledTimes(0);
        expect(onCloseFn).toBeCalledTimes(1);
    });
});
