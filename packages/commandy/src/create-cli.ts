import { Program } from "./program";
import { ProgramOptions } from "./program-options";

export function createCLI(opts: ProgramOptions): Program {
    return new Program(opts);
}
