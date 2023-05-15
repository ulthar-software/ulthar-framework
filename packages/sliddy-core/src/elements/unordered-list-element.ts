import { SlideElement } from "./slide-element.js";

export interface SlideUnorderedListElement extends SlideElement {
    type: "unordered-list";
    content: string[];
}
