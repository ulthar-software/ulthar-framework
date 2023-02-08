import { Flag } from "../flag.js";
import { isFlag } from "./is-flag.js";

export function parseFlagsUptoPositional(
    argv: string[],
    flags: Flag[]
): [string[], Record<string, any>] {
    const parsedFlags: Record<string, any> = {};
    if (flags.length > 0) {
        for (let i = 0; i < argv.length; i++) {
            const arg = argv[i];
            if (isFlag(arg)) {
                for (const flag of flags) {
                    if (flag.matches(arg)) {
                        parsedFlags[flag.name] = flag.parse(arg);
                        break;
                    }
                }
            } else {
                return [argv.slice(i), parsedFlags];
            }
        }
        return [[], parsedFlags];
    } else {
        return [argv, {}];
    }
}
