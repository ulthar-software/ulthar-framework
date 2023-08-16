export const Op = {
    Equals: <T>(value: T) => {
        return { eq: value };
    },
    Not: {
        Equals: <T>(value: T) => {
            return { neq: value };
        },
    } as const,
} as const;
