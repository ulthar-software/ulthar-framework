import { CommandOptions, LeafCommand, TopCommand } from "./command-options.js";
import { CommandHandler } from "./command-handler.js";
import { Argument } from "./argument.js";
import { errors } from "./errors.js";

export class Command {
    private _name: string;
    private handler: CommandHandler | null = null;
    private argOptions: Argument[] = [];
    private subcommands: Record<string, Command> = {};

    constructor(opts: LeafCommand | TopCommand) {
        this._name = opts.name;
        if ("handler" in opts) {
            this.handler = opts.handler;
            this.argOptions = opts.args
                ? opts.args.map((opts) => new Argument(opts))
                : [];
            errors.assert(!("commands" in opts)).orThrow("INVALID_COMMAND", {
                cmdName: opts.name,
            });
        } else {
            for (const cmdOpt of opts.commands) {
                this.subcommands[cmdOpt.name] = new Command(cmdOpt);
            }
        }
    }

    run(argv: string[]) {
        if (this.handler) {
            const args: Record<string, any> = {};
            errors
                .assert(argv.length === this.argOptions.length)
                .orThrow("INVALID_ARGUMENTS");
            this.argOptions.forEach((arg, i) => {
                args[arg.name] = arg.parse(argv[i]);
            });
            this.handler(args);
        } else {
            errors.assert(argv[0]).orThrow("NO_SUBCOMMAND", {
                subcommands: Object.keys(this.subcommands),
            });
            const cmd = this.subcommands[argv[0]];
            errors.assert(cmd).orThrow("INVALID_SUBCOMMAND", {
                cmdName: argv[0],
            });
            cmd.run(argv.slice(1));
        }
    }
}
