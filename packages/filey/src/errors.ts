import { ErrorContainer, ErrorTemplate } from "@ulthar/blamey";

export const ERRORS = {
    INVALID_RELATIVE_PATH: new ErrorTemplate(
        "File paths must always be ABSOLUTE paths. Tried to use '{{path}}'"
    ),
    MISSING_FILE: new ErrorTemplate(
        "Requested file '{{path}}' does not exists"
    ),
    INVALID_JSON: new ErrorTemplate(
        "Requested file '{{path}}' doesn't contain valid JSON: \n{{err}}"
    ),
    NOT_A_DIRECTORY: new ErrorTemplate(
        "The path '{{path}}' is not a directory"
    ),
};

export const Errors = new ErrorContainer(ERRORS);
