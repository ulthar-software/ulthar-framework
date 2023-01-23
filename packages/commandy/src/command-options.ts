import { ArgumentOptions } from "./argument-options.js";
import { CommandHandler } from "./command-handler.js";

export type CommandOptions = LeafCommand | TopCommand;

export interface LeafCommand {
    name: string;
    handler: CommandHandler;
    args?: ArgumentOptions[];
}

export interface TopCommand {
    name: string;
    commands: CommandOptions[];
}
