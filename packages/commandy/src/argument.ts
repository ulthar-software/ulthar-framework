import { assert } from "@ulthar/asserty";
import { ArgumentOptions } from "./argument-options";
import { ArgumentType } from "./argument-type";

export type ArgumentParser = (value: string) => any;

export class Argument {
    private _name: string;
    get name(): string {
        return this._name;
    }
    private type: ArgumentType;
    private options: any[];

    private argumentParsers: Record<ArgumentType, ArgumentParser> = {
        string: (value: string) => {
            this.assertValidOption(value);
            return value;
        },
        number: (value: string) => {
            const result = Number(value);
            assert(!Number.isNaN(result), "Value is not a number");
            this.assertValidOption(result);
            return result;
        },
    };

    private assertValidOption(value: any) {
        if (this.options.length > 0) {
            assert(this.options.includes(value), "Value is not an option");
        }
    }

    constructor(opts: ArgumentOptions) {
        this._name = opts.name;
        this.type = opts.type;
        this.options = opts.options ? opts.options : [];
    }

    parse(value: string): any {
        return this.argumentParsers[this.type](value);
    }
}
