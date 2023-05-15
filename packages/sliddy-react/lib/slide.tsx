import styled from "styled-components";
import { Slide } from "@ulthar/sliddy-core";
import { createLayoutForSlide } from "./layouts/layout-factory.js";

export type SlideProps = {
    index: number;
    slide: Slide;
};

const SlideWrapper = styled.div({
    flex: "1 0 100%",
    height: "100%",
    width: "100%",
    padding: "20px",
});

export function SlideComponent({ slide }: SlideProps) {
    return <SlideWrapper>{createLayoutForSlide(slide)}</SlideWrapper>;
}
