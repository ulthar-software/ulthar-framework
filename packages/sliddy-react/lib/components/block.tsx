import { SlideElement } from "@ulthar/sliddy-core";
import { FlexContainer } from "../utils/flex-container.tsx";
import { createComponentsFromElementArray } from "./component-factory.tsx";

interface BlockElementProps {
    element: SlideElement;
}

export function BlockElement({ element }: BlockElementProps) {
    if (!element.content)
        return <FlexContainer style={element.styles as any}></FlexContainer>;
    if (Array.isArray(element.content))
        return (
            <FlexContainer style={element.styles as any}>
                {createComponentsFromElementArray(element.content)}
            </FlexContainer>
        );
    return (
        <FlexContainer style={element.styles as any}>
            {element.content}
        </FlexContainer>
    );
}
