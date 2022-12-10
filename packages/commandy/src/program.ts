import { Command } from "./command";
import { CommandOptions } from "./command-options";
import { ProgramOptions } from "./program-options";

export class Program {
    private commands: Record<string, Command> = {};

    constructor(opts: ProgramOptions) {
        opts.commands.forEach((cmdOpts) => this.addCommand(cmdOpts));
    }

    addCommand(options: CommandOptions) {
        this.commands[options.name] = new Command(options);
        return this;
    }

    run(argv: string[]) {
        let parsedArgv = argv.slice(1);
        this.commands[parsedArgv[0]].run(parsedArgv.slice(1));
    }
}
