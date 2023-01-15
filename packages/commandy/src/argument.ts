import { assert } from "@ulthar/asserty";
import { ArgumentOptions } from "./argument-options.js";

export type ArgumentParser = (value: string) => any;

export class Argument {
    private _name: string;
    get name(): string {
        return this._name;
    }
    private options: any[];

    private assertValidOption(value: any) {
        if (this.options.length > 0) {
            assert(this.options.includes(value), "Value is not an option");
        }
    }

    constructor(opts: ArgumentOptions) {
        this._name = opts.name;
        this.options = opts.options ? opts.options : [];
    }

    parse(value: string): any {
        this.assertValidOption(value);
        return value;
    }
}
