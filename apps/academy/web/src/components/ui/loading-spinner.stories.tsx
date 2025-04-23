import type { Meta, StoryObj } from "@storybook/react";
import { LoadingSpinner } from "./loading-spinner.tsx";

const meta: Meta<typeof LoadingSpinner> = {
  component: LoadingSpinner,
  title: "Components/Basic/Loading",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};
export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};
