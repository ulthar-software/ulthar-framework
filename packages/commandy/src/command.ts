import { assert } from "@ulthar/asserty";
import { CommandOptions } from "./command-config";
import { CommandHandler } from "./command-handler";
import { Argument } from "./argument";

export class Command {
    private _name: string;
    private handler: CommandHandler;
    private argOptions: Argument[];

    constructor(config: CommandOptions) {
        this._name = config.name;
        this.handler = config.handler;
        this.argOptions = config.args
            ? config.args.map((opts) => new Argument(opts))
            : [];
    }

    run(argv: string[]) {
        const args: Record<string, any> = {};
        assert(
            argv.length === this.argOptions.length,
            "Incorrect number of arguments"
        );
        this.argOptions.forEach((arg, i) => {
            args[arg.name] = arg.parse(argv[i]);
        });
        this.handler(args);
    }
}
