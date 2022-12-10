import { ArgumentOptions } from "./argument-options";
import { CommandHandler } from "./command-handler";

export interface CommandOptions {
    name: string;
    handler: CommandHandler;
    args?: ArgumentOptions[];
}
