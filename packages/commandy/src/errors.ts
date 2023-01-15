import { ErrorContainer, ErrorTemplate, ErrorType } from "@ulthar/blamey";

export const errors = new ErrorContainer({
    INVALID_ARGUMENTS: new ErrorTemplate(
        "Invalid number of arguments",
        ErrorType.USER_ERROR
    ),
    INVALID_OPTION: new ErrorTemplate(
        "Value '{{value}}' is not an option: {{options}}",
        ErrorType.USER_ERROR
    ),
});
