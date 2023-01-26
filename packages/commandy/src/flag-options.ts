export type FlagType = "simple" | "value";

export interface FlagOptions {
    name: string;
    type?: FlagType;
    aliases?: string[];
}
