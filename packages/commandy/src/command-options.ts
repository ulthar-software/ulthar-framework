import { ArgumentOptions } from "./argument-options.js";
import { CommandHandler } from "./command-handler.js";

export interface CommandOptions {
    name: string;
    handler: CommandHandler;
    args?: ArgumentOptions[];
}
