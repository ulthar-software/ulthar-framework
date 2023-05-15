import { DivColumn } from "../utils/div-column.tsx";
import { FlexContainer } from "../utils/flex-container.js";
import { Heading } from "../utils/heading.tsx";
import { parseStringMarkdown } from "../utils/parse-markdown.tsx";

export interface TitleProps {
    title: string;
    subtitle: string;
    image?: string;
    imageColumnColor?: string;
}

export function TitleLayout({
    title,
    subtitle,
    image,
    imageColumnColor,
}: TitleProps) {
    return (
        <FlexContainer
            style={{
                height: "100%",
                width: "100vw",
                marginLeft: "-20px",
                marginTop: "-20px",
            }}
        >
            {image && (
                <DivColumn
                    style={{
                        width: "30%",
                        backgroundColor: imageColumnColor
                            ? imageColumnColor
                            : "#000",
                        justifyContent: "center",
                    }}
                >
                    <img style={{ padding: "50px" }} src={image} alt="" />
                </DivColumn>
            )}
            <DivColumn
                style={{
                    width: image ? "70%" : "100%",
                    justifyContent: "center",
                    alignItems: "center",
                }}
            >
                <Heading>{parseStringMarkdown(title)}</Heading>
                {subtitle && <p>{parseStringMarkdown(subtitle)}</p>}
            </DivColumn>
        </FlexContainer>
    );
}
