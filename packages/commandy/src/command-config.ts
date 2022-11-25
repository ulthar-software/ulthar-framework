import { MaybePromise } from "@ulthar/typey";
import { ArgumentOptions } from "./argument-options";

export interface CommandOptions {
    name: string;
    handler: (args: Record<string, any>) => MaybePromise<void>;
    args?: ArgumentOptions[];
}
