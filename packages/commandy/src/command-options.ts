import { ArgumentOptions } from "./argument-options.js";
import { CommandHandler } from "./command-handler.js";
import { FlagOptions } from "./flag-options.js";

export type CommandOptions = LeafCommand | TopCommand;

export interface BaseOptions {
    name: string;
    passExtraArgs?: boolean;
    flags?: FlagOptions[];
}

export interface LeafCommand extends BaseOptions {
    handler: CommandHandler;
    args?: ArgumentOptions[];
}

export interface TopCommand extends BaseOptions {
    commands: CommandOptions[];
}
