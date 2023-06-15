import { SlideElement } from "./slide-element.js";

export interface SlideCodeElement extends SlideElement {
    type: "code";
    content: undefined;
    properties: {
        language: string;
        code?: string;
        file?: string;
        lineNumbers?: boolean;
    };
}
