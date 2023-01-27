import { ArgumentOptions } from "./argument-options.js";
import { errors } from "./errors.js";

export type ArgumentParser = (value: string) => any;

export class Argument {
    private _name: string;
    private _isOptional: boolean;
    private options: any[];

    get name(): string {
        return this._name;
    }
    public get isOptional(): boolean {
        return this._isOptional;
    }

    private assertValidOption(value: any) {
        if (this.options.length > 0) {
            errors
                .assert(this.options.includes(value))
                .orThrow("INVALID_OPTION", {
                    value,
                    options: this.options.join(", "),
                });
        }
    }

    constructor(opts: ArgumentOptions) {
        this._name = opts.name;
        this._isOptional = opts.optional ?? false;
        this.options = opts.options ? opts.options : [];
    }

    parse(value: string): any {
        this.assertValidOption(value);
        return value;
    }
}
