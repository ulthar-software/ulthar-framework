import { SlideElementStyles } from "./styles.js";
import { SlideElement } from "./elements/slide-element.js";
import { PropertyValue } from "./property-value.js";

export interface Slide {
    type: string;
    elements?: SlideElement[] | SlideElement[][];
    properties?: Record<string, PropertyValue>;
    style?: SlideElementStyles;
    notes?: string;
}
