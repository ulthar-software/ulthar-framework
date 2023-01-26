import { FlagOptions, FlagType } from "./flag-options";

export class Flag {
    name: string;
    private aliases: string[];
    private type: FlagType;

    constructor(opts: FlagOptions) {
        this.name = opts.name;
        this.aliases = opts.aliases ?? [];
        this.type = opts.type ?? "simple";
    }
    parse(arg: string): boolean | string {
        if (this.type == "simple") {
            return true;
        } else {
            return arg.split("=")[1];
        }
    }
    matches(arg: string): boolean {
        for (const alias of this.aliases.concat([this.name])) {
            if (alias.length == 1) {
                if (this.matchesSingleLetterAlias(arg, alias)) {
                    return true;
                }
            } else {
                if (this.matchesMultiLetterAlias(arg, alias)) {
                    return true;
                }
            }
        }
        return false;
    }
    private matchesMultiLetterAlias(arg: string, alias: string) {
        if (this.type == "simple") {
            return arg == `--${alias}`;
        } else {
            return arg.startsWith(`--${alias}=`);
        }
    }

    private matchesSingleLetterAlias(arg: string, alias: string) {
        if (this.type == "simple") {
            return arg == `-${alias}`;
        } else {
            return arg.startsWith(`-${alias}=`);
        }
    }
}
