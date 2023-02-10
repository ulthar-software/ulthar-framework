import { ErrorContainer, ErrorTemplate } from "@ulthar/blamey";

export const Errors = new ErrorContainer({
    INDEX_NOT_DEFINED: new ErrorTemplate("Index not defined"),
    ENTITY_NOT_FOUND: new ErrorTemplate("Entity '{{id}}' not found"),
});
