import { debounce } from "./debounce";
import { milliseconds } from "./milliseconds";

describe("Debounce", () => {
    it("should debounce the execution of a function", async () => {
        const fn = jest.fn();
        const debouncedFn = debounce(fn, 500);

        debouncedFn();
        debouncedFn();
        debouncedFn();
        debouncedFn();
        debouncedFn();
        debouncedFn();

        await milliseconds(1000);

        expect(fn).toHaveBeenCalledTimes(1);
    });
});
