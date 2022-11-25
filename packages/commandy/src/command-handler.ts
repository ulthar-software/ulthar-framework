import { MaybePromise } from "@ulthar/typey";

export type CommandHandler = (args: Record<string, any>) => MaybePromise<void>;
