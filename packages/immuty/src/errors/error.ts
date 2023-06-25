export const ErrorTag = "_tag" as const;
export type ErrorTag = typeof ErrorTag;

export interface Error {
    readonly [ErrorTag]: string;
    readonly message: string;
}
