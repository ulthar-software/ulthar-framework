import { FlexContainer } from "../utils/flex-container.js";
import { Heading } from "../utils/heading.js";
import { parseStringMarkdown } from "../utils/parse-markdown.js";

export interface ObjectivesProps {
    objectivesTitle: string;
    objectives: string[];
}

export function Objectives({ objectives, objectivesTitle }: ObjectivesProps) {
    return (
        <FlexContainer
            style={{
                flexDirection: "column",
                justifyContent: "center",
                height: "100%",
            }}
        >
            <Heading
                style={{
                    marginBottom: "50px",
                }}
            >
                {parseStringMarkdown(objectivesTitle)}
            </Heading>
            <ul
                style={{
                    paddingLeft: "3em",
                }}
            >
                {objectives.map((objective, index) => (
                    <li
                        style={{
                            marginBottom: "16px",
                        }}
                        key={index}
                    >
                        {parseStringMarkdown(objective)}
                    </li>
                ))}
            </ul>
        </FlexContainer>
    );
}
