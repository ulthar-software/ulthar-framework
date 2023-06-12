import { SlideUnorderedListElement } from "@ulthar/sliddy-core";
import { parseStringMarkdown } from "../utils/parse-markdown.tsx";

export interface UnorderedListElementProps {
    element: SlideUnorderedListElement;
}

export function UnorderedListElement({ element }: UnorderedListElementProps) {
    return (
        <ul
            style={
                {
                    padding: "18px",
                    paddingLeft: "58px",
                    ...element.styles,
                } as any
            }
        >
            {element.content.map((item, index) => (
                <li key={index}>{parseStringMarkdown(item)}</li>
            ))}
        </ul>
    );
}
