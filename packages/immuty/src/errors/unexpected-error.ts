import { createNativeErrorWrapperWith } from "./create-native-error-wrapper.js";
import { createTaggedError } from "./create-tagged-error.js";

export const UnexpectedError = createTaggedError("UnexpectedError");

export const defaultErrorWrapper =
    createNativeErrorWrapperWith(UnexpectedError);
