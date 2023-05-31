import {
    SlideCodeElement,
    SlideElement,
    SlideTextElement,
} from "@ulthar/sliddy-core";
import { TextElement } from "./text-element.js";
import { HeadingElement } from "./heading-element.js";
import { UnorderedListElement } from "./unordered-list.js";
import { BlockElement } from "./block.js";
import { CodeElement } from "./code.js";
import { ImageElement, ImageSlideElement } from "./image.js";

const componentFactories: Record<string, (e: any) => JSX.Element> = {
    text: (element: SlideTextElement) => <TextElement element={element} />,
    heading: (element: SlideTextElement) => (
        <HeadingElement element={element} />
    ),
    "unordered-list": (element: any) => (
        <UnorderedListElement element={element} />
    ),
    block: (element: SlideElement) => <BlockElement element={element} />,
    code: (element: SlideCodeElement) => <CodeElement element={element} />,
    image: (element: ImageSlideElement) => <ImageElement element={element} />,
};

export function createComponentFromElement(
    element: SlideElement | string
): string | JSX.Element {
    if (typeof element === "string") return element;
    return componentFactories[element.type](element);
}

export function createComponentsFromElementArray(
    elements:
        | string
        | SlideElement
        | string[]
        | SlideElement[]
        | SlideElement[][]
        | undefined
): (string | JSX.Element)[] {
    if (!elements) return [];
    if (!Array.isArray(elements)) {
        return [createComponentFromElement(elements)];
    }
    return elements.flatMap(
        (element: string | SlideElement | SlideElement[]) => {
            if (Array.isArray(element)) {
                return element.map(createComponentFromElement);
            } else {
                return createComponentFromElement(element);
            }
        }
    );
}
