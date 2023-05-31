import { SlideElement } from "@ulthar/sliddy-core";

export interface ImageSlideElement extends SlideElement {
    type: "image";
    src: string;
}

export function ImageElement({ element }: { element: ImageSlideElement }) {
    return <img src={element.src} style={element.styles as any} />;
}
