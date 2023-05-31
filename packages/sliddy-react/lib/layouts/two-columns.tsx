import styled from "styled-components";
import { Slide } from "@ulthar/sliddy-core";
import { createComponentsFromElementArray } from "../components/component-factory.js";

const DivColumn = styled.div({
    display: "flex",
    flexDirection: "column",
    height: "100%",
    justifyContent: "center",
    padding: "15px",
    width: "40%",
});

export interface TwoColumnProps {
    slide: Slide;
}

export function TwoColumnsLayout({ slide }: TwoColumnProps) {
    if (!slide.elements) {
        console.error("No elements in slide", slide);
        return null;
    }
    const [firstElementColumn, secondElementColumn] = slide.elements;

    const firstColumn = createComponentsFromElementArray(firstElementColumn);
    const secondColumn = createComponentsFromElementArray(secondElementColumn);

    return (
        <div
            style={{
                display: "flex",
                height: "100%",
                justifyContent: "center",
                padding: "200px",
            }}
        >
            <DivColumn
                style={{
                    width: (slide.properties?.column1Width as string) ?? "40%",
                    padding: "15px",
                }}
            >
                {firstColumn}
            </DivColumn>
            <DivColumn
                style={{
                    width: (slide.properties?.column2Width as string) ?? "60%",
                    padding: "15px",
                }}
            >
                {secondColumn}
            </DivColumn>
        </div>
    );
}
