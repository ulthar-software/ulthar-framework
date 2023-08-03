import { createTaggedError } from "@ulthar/immuty";

export const UnknownTableError = createTaggedError("UnknownTable");
export type UnknownTableError = ReturnType<typeof UnknownTableError>;

export type SelectErrors = UnknownTableError;
