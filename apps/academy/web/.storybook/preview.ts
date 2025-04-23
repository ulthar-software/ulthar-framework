import type { Preview } from "@storybook/react";
import "../src/index.css";
import { Decorator } from "../src/utils/storybook/decorator.tsx";

const preview: Preview = {
  parameters: {
    controls: {
      matchers: {
        color: /(background|color)$/i,
        date: /Date$/i,
      },
    },
  },

  decorators: [Decorator],
};

export default preview;
