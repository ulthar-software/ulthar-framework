import { ArgumentOptions } from "./argument-options.js";
import { CommandHandler } from "./command-handler.js";

export type CommandOptions = BaseOptions & (LeafCommand | TopCommand);

export interface BaseOptions {
    name: string;
    passExtraArgs?: boolean;
}

export interface LeafCommand {
    handler: CommandHandler;
    args?: ArgumentOptions[];
}

export interface TopCommand {
    commands: CommandOptions[];
}
