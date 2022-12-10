import { createCLI } from "./create-cli";

describe("Create CLI", () => {
    it("should create a command line program and execute it correctly given commands configuration", () => {
        const fn = jest.fn();
        createCLI({
            commands: [
                {
                    name: "test",
                    handler: fn,
                },
            ],
        }).run(["cli", "test"]);

        expect(fn).toHaveBeenCalled();
    });

    it("should fail to execute correctly given commands configuration", () => {
        const fn = jest.fn();
        createCLI({
            commands: [
                {
                    name: "test",
                    handler: fn,
                },
            ],
        }).run(["cli", "test"]);

        expect(fn).toHaveBeenCalled();
    });
});
