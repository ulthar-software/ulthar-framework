import { Program } from "./program.js";
import { ProgramOptions } from "./program-options.js";

export function createCLI(opts: ProgramOptions): Program {
    return new Program(opts);
}
