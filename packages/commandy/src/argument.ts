import { ArgumentOptions } from "./argument-options.js";
import { errors } from "./errors.js";

export type ArgumentParser = (value: string) => any;

export class Argument {
    private _name: string;
    get name(): string {
        return this._name;
    }
    private options: any[];

    private assertValidOption(value: any) {
        if (this.options.length > 0) {
            errors.assert(this.options.includes(value), "INVALID_OPTION", {
                value,
                options: this.options.join(", "),
            });
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
