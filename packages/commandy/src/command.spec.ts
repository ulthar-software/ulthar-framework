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

    it("should parse a command given a configuration with a flag", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            args: [{ name: "arg" }],
            flags: [{ name: "f" }, { name: "output", type: "value" }],
        });
        command.run(["-f", "--output=foo/bar", "test"]);
        expect(fn).toHaveBeenCalledWith({
            f: true,
            output: "foo/bar",
            arg: "test",
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

    it("should pass all extra args to the handler when configured", () => {
        const fn = jest.fn();
        const command = new Command({
            name: "test-command",
            handler: fn,
            passExtraArgs: true,
            args: [],
        });
        command.run(["banana"]);
        expect(fn).toHaveBeenCalledWith({ extraArgs: ["banana"] });
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

    it("should parse a command with subcommands", () => {
        const fn1 = jest.fn();
        const fn2 = jest.fn();
        const command = new Command({
            name: "test-command",
            commands: [
                {
                    name: "foo",
                    handler: fn1,
                },
                {
                    name: "bar",
                    handler: fn2,
                    args: [
                        {
                            name: "test-arg",
                        },
                    ],
                },
            ],
        });

        command.run(["foo"]);
        expect(fn1).toHaveBeenCalledWith({});

        command.run(["bar", "baz"]);
        expect(fn2).toHaveBeenCalledWith({ "test-arg": "baz" });

        expect(() => {
            command.run(["fee"]);
        }).toThrow(errors.render("INVALID_SUBCOMMAND", { cmdName: "fee" }));

        expect(() => {
            command.run([]);
        }).toThrow(
            errors.render("NO_SUBCOMMAND", { subcommands: ["foo", "bar"] })
        );

        expect(() => {
            command.run(["bar"]);
        }).toThrow();
    });

    it("should correctly parse the flags of a top command and subcommands", () => {
        const fn1 = jest.fn();
        const command = new Command({
            name: "test-command",
            flags: [
                {
                    name: "output",
                    type: "value",
                },
            ],
            commands: [
                {
                    name: "foo",
                    handler: fn1,
                    flags: [
                        {
                            name: "t",
                        },
                    ],
                },
            ],
        });

        command.run(["foo"]);
        expect(fn1).toHaveBeenCalledWith({});

        command.run(["foo", "-t"]);
        expect(fn1).toHaveBeenCalledWith({ t: true });

        expect(() => {
            command.run(["--output=bar"]);
        }).toThrow(errors.render("NO_SUBCOMMAND", { subcommands: ["foo"] }));

        command.run(["--output=bar", "foo"]);
        expect(fn1).toHaveBeenCalledWith({ output: "bar" });
    });
});
