import { useEffect, useState } from "react";
import { SlideComponent } from "./slide.js";
import { Deck } from "@ulthar/sliddy-core";
import { styled } from "styled-components";
import { ThemeProvider } from "styled-components";
import { DefaultTheme } from "styled-components";

export type DeckProps = {
    deck: Deck;
};

const DeckContainer = styled.div(({ theme }) => ({
    display: "flex",
    flexDirection: "column",
    height: "100vh",
    width: "100%",
    overflow: "hidden",
    color: theme.primaryColor,
    backgroundColor: theme.backgroundColor,
    fontFamily: theme.fontFamily,
    fontSize: theme.fontSize,
}));

const DeckProgressSlider = styled.div(({ theme }) => ({
    position: "absolute",
    bottom: "0",
    left: "0",
    height: "3px",
    transition: "width 0.5s ease-in-out",
    backgroundColor: theme.accentColor,
}));

export function DeckComponent({ deck }: DeckProps) {
    const [currentIndex, setCurrentIndex] = useState<number>(-1);
    const [cursorPointer, setCursorPointer] = useState<boolean>(false);

    const handleKeyDown = (event: React.KeyboardEvent) => {
        switch (event.key) {
            case "ArrowLeft":
                setCurrentIndex((prevIndex) =>
                    prevIndex > 0 ? prevIndex - 1 : prevIndex
                );
                break;
            case "ArrowRight":
                setCurrentIndex((prevIndex) =>
                    prevIndex < deck.slides.length - 1
                        ? prevIndex + 1
                        : prevIndex
                );
                break;
            case "p":
                setCursorPointer((prev) => !prev);
                break;
        }
    };

    useEffect(() => {
        document.title = deck.name;

        const hash = window.location.hash;
        if (hash) {
            const index = parseInt(hash.substring(1));
            console.log(index);
            if (!isNaN(index)) {
                setCurrentIndex(index);
            }
        } else {
            setCurrentIndex(0);
        }
    }, []);

    useEffect(() => {
        if (currentIndex >= 0) {
            window.location.hash = `${currentIndex}`;
        }
    }, [currentIndex]);

    if (currentIndex < 0) {
        return null;
    }

    const currentSlide = deck.slides[currentIndex];

    return (
        <ThemeProvider theme={deck.styles as DefaultTheme}>
            <DeckContainer
                style={{
                    cursor: cursorPointer
                        ? "url(laser-pointer.png) 4 12, auto"
                        : "default",
                }}
            >
                <SlideComponent index={currentIndex} slide={currentSlide} />
                <DeckProgressSlider
                    style={{
                        width: `${
                            ((currentIndex + 1) / deck.slides.length) * 100
                        }%`,
                    }}
                    tabIndex={0}
                    onKeyDown={handleKeyDown}
                />
            </DeckContainer>
        </ThemeProvider>
    );
}
