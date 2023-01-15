import { milliseconds } from "../time/milliseconds";
import { ObservableSubject } from "./observable-subject";

describe("Observable Subject", () => {
    it("should execute the subscription given a value in constructor", async () => {
        const subject = new ObservableSubject<string>("banana");
        const fn = jest.fn();
        subject.subscribe(fn);
        await milliseconds(1);
        expect(fn).toHaveBeenCalledWith("banana");
    });

    it("should not execute the subscription not given a value in constructor", async () => {
        const subject = new ObservableSubject<string>();
        const fn = jest.fn();
        subject.subscribe(fn);
        await milliseconds(1);
        expect(fn).not.toHaveBeenCalled();
    });

    it("should execute the subscription given an updated value", async () => {
        const subject = new ObservableSubject<string>();
        const fn = jest.fn();
        subject.subscribe(fn);
        await milliseconds(1);
        subject.update("manzana");
        await milliseconds(1);
        expect(fn).toHaveBeenCalledWith("manzana");
    });

    it("should only execute the onChange callback given an updated value", async () => {
        const subject = new ObservableSubject<string>("banana");
        const fn = jest.fn();
        subject.onChange(fn);
        await milliseconds(1);
        expect(fn).not.toHaveBeenCalledWith("banana");
        subject.update("manzana");
        await milliseconds(1);
        expect(fn).toHaveBeenCalledWith("manzana");
    });
});
