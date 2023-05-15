import { SlideTextElement } from "@ulthar/sliddy-core";
import { Heading } from "../utils/heading.js";
import { parseStringMarkdown } from "../utils/parse-markdown.js";

export interface HeadingElementProps {
    element: SlideTextElement;
}

export function HeadingElement({ element }: HeadingElementProps) {
    return (
        <Heading style={{ ...element.styles } as any}>
            {parseStringMarkdown(element.content)}
        </Heading>
    );
}
