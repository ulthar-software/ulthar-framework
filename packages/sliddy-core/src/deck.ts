import { Slide } from "./slide.js";
import { SlideElementStyles } from "./styles.js";
import { PropertyValue } from "./property-value.js";

export interface Deck {
    name: string;
    properties: Record<string, PropertyValue>;
    slides: Array<Slide>;
    styles: SlideElementStyles;
}
