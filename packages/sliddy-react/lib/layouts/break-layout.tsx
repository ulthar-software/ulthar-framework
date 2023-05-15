import { DivColumn } from "../utils/div-column.js";
import { FlexContainer } from "../utils/flex-container.js";
import { TitleHeading, Heading } from "../utils/heading.js";
import { Logo } from "../utils/logo.js";
import { MediaIFrame } from "../utils/media-iframe.js";
import { parseStringMarkdown } from "../utils/parse-markdown.js";
import { Timer } from "../utils/timer.js";

export interface BreakLayoutProps {
    title: string;
    footer: string;
    media: string;
    durationInMinutes: number;
    logo?: string;
}

export function BreakLayout({
    title,
    footer,
    media,
    logo,
    durationInMinutes,
}: BreakLayoutProps) {
    return (
        <FlexContainer>
            {logo ? <Logo src={logo} pos="tl" /> : null}
            <DivColumn
                style={{
                    justifyContent: "center",
                    width: "60%",
                    paddingLeft: "40px",
                }}
            >
                <TitleHeading>¡Descanso!</TitleHeading>
                <Heading>{parseStringMarkdown(title)}</Heading>
                <Heading
                    style={{
                        position: "absolute",
                        bottom: "30px",
                        left: "60px",
                        fontSize: "0.8em",
                    }}
                >
                    {parseStringMarkdown(footer)}
                </Heading>
            </DivColumn>
            <DivColumn
                style={{
                    justifyContent: "center",
                    alignItems: "center",
                    width: "50%",
                }}
            >
                <MediaIFrame
                    src={media}
                    style={{
                        width: "768px",
                        height: "432px",
                    }}
                />
                <Timer
                    durationInMinutes={durationInMinutes}
                    buttonText="Comenzar descanso..."
                    prependText="Volvemos en..."
                    timeoutMessage="Volvemos en breve..."
                />
            </DivColumn>
        </FlexContainer>
    );
}
