import {} from "@ulthar/blamey";
import { CommandOptions } from "./command-options.js";
import { CommandHandler } from "./command-handler.js";
import { Argument } from "./argument.js";
import { errors } from "./errors.js";

export class Command {
    private _name: string;
    private handler: CommandHandler;
    private argOptions: Argument[];

    constructor(opts: CommandOptions) {
        this._name = opts.name;
        this.handler = opts.handler;
        this.argOptions = opts.args
            ? opts.args.map((opts) => new Argument(opts))
            : [];
    }

    run(argv: string[]) {
        const args: Record<string, any> = {};
        errors
            .assert(argv.length === this.argOptions.length)
            .orThrow("INVALID_ARGUMENTS");

        this.argOptions.forEach((arg, i) => {
            args[arg.name] = arg.parse(argv[i]);
        });
        this.handler(args);
    }
}
