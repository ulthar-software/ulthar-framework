import { SlideTextElement } from "@ulthar/sliddy-core";
import { parseStringMarkdown } from "../utils/parse-markdown.tsx";

export interface TextElementProps {
    element: SlideTextElement;
}

export function TextElement({ element }: TextElementProps) {
    return (
        <p style={{ padding: "18px", ...element.styles } as any}>
            {parseStringMarkdown(element.content)}
        </p>
    );
}
