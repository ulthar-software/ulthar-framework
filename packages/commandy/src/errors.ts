import { ErrorContainer, ErrorTemplate, ErrorType } from "@ulthar/blamey";

export const errors = new ErrorContainer({
    INVALID_ARGUMENTS: new ErrorTemplate(
        "Invalid number of arguments.",
        ErrorType.USER_ERROR
    ),
    INVALID_OPTION: new ErrorTemplate(
        "Value '{{value}}' is not a valid option. Available options are: {{options}}.",
        ErrorType.USER_ERROR
    ),
    INVALID_SUBCOMMAND: new ErrorTemplate(
        "'{{cmdName}}' is not a valid subcommand.",
        ErrorType.USER_ERROR
    ),
    NO_SUBCOMMAND: new ErrorTemplate(
        "No subcommand selected.\n Available options are: {{subcommands}}",
        ErrorType.USER_ERROR
    ),
    INVALID_COMMAND: new ErrorTemplate(
        "Cannot have a handler function AND subcommands: {{cmdName}}"
    ),
});
