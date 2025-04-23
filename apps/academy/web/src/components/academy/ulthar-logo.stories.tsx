import type { Meta, StoryObj } from "@storybook/react";
import { UltharLogo } from "./ulthar-logo";

const meta: Meta<typeof UltharLogo> = {
  component: UltharLogo,
  title: "Components/Academy/UltharLogo",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};

export default meta;
type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {
    size: "medium",
    showText: true,
  },
};

export const Small: Story = {
  args: {
    size: "small",
    showText: true,
  },
};

export const Large: Story = {
  args: {
    size: "large",
    showText: true,
  },
};

export const LogoOnly: Story = {
  args: {
    size: "medium",
    showText: false,
  },
};
