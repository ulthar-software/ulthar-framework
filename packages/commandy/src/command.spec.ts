import { Command } from "./command";
import { CommandOptions } from "./command-config";

describe("Command", () => {
    it("should parse and execute a simple command given a simple configuration", () => {
        const fn = jest.fn();
        const commandConfig = {
            name: "test-command",
            handler: fn,
        };
        const command = new Command(commandConfig);
        command.run([]);
        expect(fn).toHaveBeenCalledWith({});
    });
    it("should parse a command given configuration with an argument", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            args: [
                {
                    name: "test-arg",
                    type: "string",
                },
            ],
        });
        command.run(["banana"]);
        expect(fn).toHaveBeenCalledWith({
            "test-arg": "banana",
        });
    });
});
