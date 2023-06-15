import { SlideElementStyles } from "../styles.js";

export const SlideElementTypeNames = [
    "text",
    "image",
    "video",
    "block",
    "unordered-list",
    "ordered-list",
    "list-item",
    "vertical-separator",
    "horizontal-separator",
    "code",
] as const;
export type SlideElementType = (typeof SlideElementTypeNames)[number];

export interface SlideElement {
    type: SlideElementType;
    styles?: SlideElementStyles;
    properties?: Record<string, any>;
    content?: string | string[] | SlideElement[] | SlideElement[][];
}
