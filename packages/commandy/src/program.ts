import { basename } from "path";
import { Command } from "./command.js";
import { CommandOptions } from "./command-options.js";
import { ProgramOptions } from "./program-options.js";

export class Program {
    private commands: Record<string, Command> = {};
    private loggerFn: (...args: unknown[]) => void;
    private debugMode: boolean;
    private name: string;

    constructor(opts: ProgramOptions) {
        opts.commands.forEach((cmdOpts) => this.addCommand(cmdOpts));
        this.loggerFn = opts.logger || console.log.bind(console);
        this.debugMode = opts.debugMode ?? false;
        this.name = opts.name;
    }

    addCommand(options: CommandOptions) {
        this.commands[options.name] = new Command(options);
        return this;
    }

    run(argv: string[]) {
        if (this.debugMode) {
            let msg = `Called with args:`;
            msg += "\n";
            argv.forEach((arg, i) => {
                msg += `[${i}] "${arg}"\n`;
            });
            this.loggerFn(msg);
        }
        try {
            let parsedArgv = this.parseArgs(argv);
            let command = this.getCommandOrThrow(parsedArgv[0]);
            command.run(parsedArgv.slice(1));
        } catch (err: any) {
            this.loggerFn(err.message);
        }
    }

    private parseArgs(args: string[]): string[] {
        if (basename(args[0]) == "node") {
            return args.slice(2);
        }

        if (args[0] == this.name) {
            return args.slice(1);
        }

        return args;
    }

    private getCommandOrThrow(cmdName: string) {
        let cmd = this.commands[cmdName];
        if (!cmd) throw new Error(`Unknown command '${cmdName}'`);
        return cmd;
    }
}
