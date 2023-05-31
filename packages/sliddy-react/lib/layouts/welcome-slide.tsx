import { CountdownTimer } from "../utils/countdown-timer.js";
import { DivColumn } from "../utils/div-column.js";
import { FlexContainer } from "../utils/flex-container.js";
import { TitleHeading, Heading } from "../utils/heading.js";
import { Logo } from "../utils/logo.js";
import { MediaIFrame } from "../utils/media-iframe.js";
import { parseStringMarkdown } from "../utils/parse-markdown.js";

export interface WelcomeSlideProps {
    title: string;
    subtitle: string;
    footer: string;
    media: string;
    startHour: number;
    startMinute: number;
    logo?: string;
}

export function WelcomeSlide({
    title,
    subtitle,
    media,
    startHour,
    startMinute,
    logo,
    footer,
}: WelcomeSlideProps) {
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
                <TitleHeading>{parseStringMarkdown(title)}</TitleHeading>
                <Heading style={{ fontSize: "1.4em" }}>
                    {parseStringMarkdown(subtitle)}
                </Heading>
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
                <CountdownTimer
                    targetHour={startHour}
                    targetMinute={startMinute}
                    prependText="Comenzamos en..."
                    timeoutMessage="Comenzamos en breve..."
                />
            </DivColumn>
        </FlexContainer>
    );
}
