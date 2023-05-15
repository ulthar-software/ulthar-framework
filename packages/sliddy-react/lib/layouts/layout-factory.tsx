import { Slide, SlideElement } from "@ulthar/sliddy-core";
import { DefaultLayout } from "./default-layout.js";
import { WelcomeSlide } from "./welcome-slide.js";
import { createComponentFromElement } from "../components/component-factory.js";
import { Objectives } from "./objectives.js";
import { Presenter } from "./presenter.js";
import { TitleLayout } from "./title.js";
import { Blackboard } from "./blackboard.js";
import { BreakLayout } from "./break-layout.js";

const layoutFactories: Record<string, (s: Slide) => JSX.Element> = {
    default: (slide: Slide) => (
        <DefaultLayout {...(slide.properties as any)}>
            {slide.elements?.map((element: SlideElement) => {
                return createComponentFromElement(element);
            })}
        </DefaultLayout>
    ),
    welcome: (slide: Slide) => <WelcomeSlide {...(slide.properties as any)} />,
    objectives: (slide: Slide) => <Objectives {...(slide.properties as any)} />,
    presenter: (slide: Slide) => <Presenter {...(slide.properties as any)} />,
    title: (slide: Slide) => <TitleLayout {...(slide.properties as any)} />,
    blackboard: (slide: Slide) => <Blackboard {...(slide.properties as any)} />,
    break: (slide: Slide) => <BreakLayout {...(slide.properties as any)} />,
};

export function createLayoutForSlide(slide: Slide) {
    if (slide.type in layoutFactories) {
        return layoutFactories[slide.type](slide);
    } else {
        return layoutFactories["default"](slide);
    }
}
