/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/naming-convention */
import { action } from "@storybook/addon-actions";
import type { ReactRenderer } from "@storybook/react";
import { useEffect } from "react";
import { MemoryRouter, useLocation } from "react-router";
import type { PartialStoryFn, StoryContext } from "storybook/internal/types";

const navigationAction = action("navigation");

function NavigationTracker() {
  const location = useLocation();

  useEffect(() => {
    navigationAction(location.pathname + location.search);
  }, [location]);

  return null;
}

export function Decorator(
  Story: PartialStoryFn<ReactRenderer, Record<string, any>>,
  { parameters }: StoryContext<ReactRenderer, Record<string, any>>,
) {
  const { pageLayout } = parameters;

  switch (pageLayout) {
    case "page":
      return (
        <MemoryRouter>
          <NavigationTracker />
          <Story />
        </MemoryRouter>
      );
    case "simple-routing":
      return (
        <MemoryRouter>
          <NavigationTracker />
          <Story />
        </MemoryRouter>
      );
    default:
      return <Story />;
  }
}
