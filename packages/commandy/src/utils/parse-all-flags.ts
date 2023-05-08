import { Flag } from "../flag.js";
import { isFlag } from "./is-flag.js";

export function parseAllFlags(
    argv: string[],
    flags: Flag[]
): [string[], Record<string, any>] {
    const argsWithoutFlags: string[] = [];
    const parsedFlags: Record<string, any> = {};
    if (flags.length > 0) {
        for (const arg of argv) {
            if (isFlag(arg)) {
                for (const flag of flags) {
                    if (flag.matches(arg)) {
                        parsedFlags[flag.name] = flag.parse(arg);
                        break;
                    }
                }
            } else {
                argsWithoutFlags.push(arg);
            }
        }
        return [argsWithoutFlags, parsedFlags];
    } else {
        return [argv, {}];
    }
}
