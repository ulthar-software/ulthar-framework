import { CommandOptions } from "./command-options.js";

export interface ProgramOptions {
    name: string;
    commands: CommandOptions[];
    logger?: (...args: unknown[]) => void;
    debugMode?: boolean;
}
