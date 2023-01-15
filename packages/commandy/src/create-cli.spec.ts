import { createCLI } from "./create-cli.js";

describe("Create CLI", () => {
    it("should create a command line program and execute it correctly given commands configuration", () => {
        const fn = jest.fn();
        createCLI({
            name: "cli",
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
        const consoleLog = jest.fn();
        createCLI({
            name: "cli",
            commands: [
                {
                    name: "test",
                    handler: fn,
                },
            ],
            logger: consoleLog,
        }).run(["cli", "banana"]);

        expect(fn).not.toHaveBeenCalled();
        expect(consoleLog).toHaveBeenCalledWith("Unknown command 'banana'");
    });

    it("should work if called with node and file arguments", () => {
        const fn = jest.fn();
        const consoleLog = jest.fn();
        createCLI({
            name: "cli",
            commands: [
                {
                    name: "test",
                    handler: fn,
                },
            ],
            logger: consoleLog,
        }).run([
            "/home/cool_guy_69/.nvm/current/bin/node",
            "/home/cool_guy_69/development/cool_cli/dist/index.js",
            "test",
        ]);
        expect(fn).toHaveBeenCalled();
        expect(consoleLog).not.toHaveBeenCalled();
    });

    it("should log debug information with debug setting", () => {
        const fn = jest.fn();
        const consoleLog = jest.fn();
        createCLI({
            name: "cli",
            commands: [
                {
                    name: "test",
                    handler: fn,
                },
            ],
            logger: consoleLog,
            debugMode: true,
        }).run(["test"]);
        expect(fn).toHaveBeenCalled();
        expect(consoleLog).toHaveBeenCalledWith(
            `Called with args:\n[0] \"test\"\n`
        );
    });
});
