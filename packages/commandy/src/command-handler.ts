export type CommandHandler = (
    args: Record<string, string>
) => MaybePromise<void>;
