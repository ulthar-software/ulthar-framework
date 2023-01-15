import { Command } from "./command.js";
import { errors } from "./errors.js";

describe("Command", () => {
    it("should parse and execute a simple command given a simple configuration", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
        });
        command.run([]);
        expect(fn).toHaveBeenCalledWith({});
    });
    it("should parse a command given a configuration with an argument", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            args: [
                {
                    name: "test-arg",
                },
            ],
        });
        command.run(["banana"]);
        expect(fn).toHaveBeenCalledWith({
            "test-arg": "banana",
        });
    });

    it("should throw while parsing a command given less arguments than configured", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            args: [
                {
                    name: "test-arg",
                },
            ],
        });
        expect(() => {
            command.run([]);
        }).toThrow();
        expect(fn).not.toHaveBeenCalled();
    });

    it("should throw while parsing a command given more arguments than configured", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            args: [],
        });
        expect(() => {
            command.run(["banana"]);
        }).toThrow();
        expect(fn).not.toHaveBeenCalled();
    });

    it("should parse a command argument when it has options", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            args: [
                {
                    name: "test-arg",
                    options: ["one", "two", "three"],
                },
            ],
        });
        command.run(["one"]);
        expect(fn).toHaveBeenCalledWith({
            "test-arg": "one",
        });
        expect(() => {
            command.run(["four"]);
        }).toThrow(
            errors.render("INVALID_OPTION", {
                value: "four",
                options: ["one", "two", "three"].join(", "),
            })
        );
    });
});
