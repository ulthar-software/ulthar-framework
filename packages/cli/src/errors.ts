import { ErrorContainer, ErrorTemplate, ErrorType } from "@ulthar/blamey";

export const errors = new ErrorContainer({
    INVALID_TEMPLATE_TYPE: new ErrorTemplate(
        "Invalid template type: {{type}}. Options are: {{validTypes}}",
        ErrorType.USER_ERROR
    ),
});
