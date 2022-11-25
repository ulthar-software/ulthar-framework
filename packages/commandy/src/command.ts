import { CommandOptions } from "./command-config";

export class Command {
    constructor(private config: CommandOptions) {}
    run(argv: string[]) {
        const args: Record<string, any> = {};
        if (this.config.args) {
            this.config.args.forEach((arg, i) => {
                args[arg.name] = argv[i];
            });
        }
        this.config.handler(args);
    }
}
