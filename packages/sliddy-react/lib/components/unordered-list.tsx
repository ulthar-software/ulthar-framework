import { SlideUnorderedListElement } from "@ulthar/sliddy-core";

export interface UnorderedListElementProps {
    element: SlideUnorderedListElement;
}

export function UnorderedListElement({ element }: UnorderedListElementProps) {
    return (
        <ul style={{ ...element.styles } as any}>
            {element.content.map((item, index) => (
                <li key={index}>{item}</li>
            ))}
        </ul>
    );
}
