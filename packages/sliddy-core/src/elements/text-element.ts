import { SlideElement } from "./slide-element.js";

export interface SlideTextElement extends SlideElement {
    type: "text";
    content: string;
}
