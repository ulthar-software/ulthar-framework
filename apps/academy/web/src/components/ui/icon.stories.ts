import type { Meta, StoryObj } from "@storybook/react";
import { Icon } from "./icon";

const meta: Meta<typeof Icon> = {
  component: Icon,
  title: "Components/Basic/Icon",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    name: "bx-plus",
  },
};
