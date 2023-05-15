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
    const [currentIndex, setCurrentIndex] = useState<number>(0);
    const [cursorPointer, setCursorPointer] = useState<boolean>(false);

    useEffect(() => {
        const handleKeyDown = (event: KeyboardEvent) => {
            console.log(event.key);
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
        window.addEventListener("keydown", handleKeyDown);
        return () => window.removeEventListener("keydown", handleKeyDown);
    }, [deck.slides.length]);

    useEffect(() => {
        document.title = deck.name;

        const hash = window.location.hash;
        if (hash) {
            const index = parseInt(hash.substring(1));
            if (!isNaN(index)) {
                setCurrentIndex(index);
            }
        }
    }, []);

    useEffect(() => {
        if (currentIndex > 0) {
            window.location.hash = `#${currentIndex}`;
        }
    }, [currentIndex]);

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
                />
            </DeckContainer>
        </ThemeProvider>
    );
    // return (
    //     <ThemeProvider theme={deck.styles as DefaultTheme}>
    //         <DeckContainer>
    //             <SlideContainer
    //                 style={{
    //                     transform: `translateX(${translateX}%)`,
    //                 }}
    //             >
    //                 {deck.slides.map((slide: any, index: number) => (
    //                     <SlideComponent
    //                         key={slide.id}
    //                         index={index}
    //                         slide={slide}
    //                     />
    //                 ))}
    //             </SlideContainer>
    //             <DeckProgressSlider
    //                 style={{
    //                     width: `${
    //                         ((currentIndex + 1) / deck.slides.length) * 100
    //                     }%`,
    //                 }}
    //             />
    //         </DeckContainer>
    //     </ThemeProvider>
    // );
}
