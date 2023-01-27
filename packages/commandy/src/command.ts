import { CommandOptions, LeafCommand, TopCommand } from "./command-options.js";
import { CommandHandler } from "./command-handler.js";
import { Argument } from "./argument.js";
import { errors } from "./errors.js";
import { Flag } from "./flag.js";
import { isFlag } from "./utils/is-flag.js";
import { parseFlagsUptoPositional } from "./utils/parse-flags-upto-positional.js";
import { parseAllFlags } from "./utils/parse-all-flags.js";

export class Command {
    private name: string;
    private handler: CommandHandler | null = null;
    private positionalArguments: Argument[] = [];
    private flags: Flag[] = [];
    private subcommands: Record<string, Command> = {};
    private passExtraArgs: boolean = false;

    constructor(opts: CommandOptions) {
        this.name = opts.name;
        this.passExtraArgs = opts.passExtraArgs ?? false;
        this.flags =
            opts.flags?.map((flagOptions) => new Flag(flagOptions)) ?? [];

        if ("handler" in opts) {
            this.parseLeafCommand(opts);
        } else {
            this.parseTopCommand(opts);
        }
    }

    run(argv: string[], topCommandFlags: Record<string, any> = {}) {
        if (this.handler) {
            const [argsWithoutFlags, parsedFlags] = parseAllFlags(
                argv,
                this.flags
            );
            const parsedArgs = this.parsePositionalArgs(argsWithoutFlags);
            this.handler(
                Object.assign(topCommandFlags, parsedArgs, parsedFlags)
            );
        } else {
            const [argsWithoutFlags, parsedFlags] = parseFlagsUptoPositional(
                argv,
                this.flags
            );
            const cmd = this.parseSubCommand(argsWithoutFlags);
            cmd.run(
                argsWithoutFlags.slice(1),
                Object.assign(topCommandFlags, parsedFlags)
            );
        }
    }

    private parseSubCommand(argv: string[]) {
        errors.assert(argv[0]).orThrow("NO_SUBCOMMAND", {
            subcommands: Object.keys(this.subcommands),
        });
        const cmd = this.subcommands[argv[0]];
        errors.assert(cmd).orThrow("INVALID_SUBCOMMAND", {
            cmdName: argv[0],
        });
        return cmd;
    }

    private parsePositionalArgs(argv: string[]) {
        const parsedArgs: Record<string, any> = {};

        errors
            .assert(this.isValidAmountOfArgs(argv))
            .orThrow("INVALID_ARGUMENTS");

        this.positionalArguments.forEach((arg, i) => {
            parsedArgs[arg.name] = arg.parse(argv[i]);
        });
        if (this.passExtraArgs) {
            parsedArgs.extraArgs = argv.slice(this.positionalArguments.length);
        }
        return parsedArgs;
    }

    private getRequiredPositionalArgumentsCount() {
        return this.positionalArguments.filter((arg) => !arg.isOptional).length;
    }

    private isValidAmountOfArgs(argv: string[]) {
        const requiredArgsCount = this.getRequiredPositionalArgumentsCount();
        return (
            argv.length >= requiredArgsCount &&
            (argv.length === requiredArgsCount ||
                argv.length === this.positionalArguments.length ||
                this.passExtraArgs)
        );
    }

    private parseLeafCommand(opts: LeafCommand) {
        this.handler = opts.handler;
        this.positionalArguments = opts.args
            ? opts.args.map((opts) => new Argument(opts))
            : [];
        errors.assert(!("commands" in opts)).orThrow("INVALID_COMMAND", {
            cmdName: opts.name,
        });
    }

    private parseTopCommand(opts: TopCommand) {
        for (const cmdOpt of opts.commands) {
            this.subcommands[cmdOpt.name] = new Command(cmdOpt);
        }
    }
}
