import type { Meta, StoryObj } from "@storybook/react";
import { Anchor } from "./anchor.tsx";

const meta: Meta<typeof Anchor> = {
  title: "Components/Basic/Anchor",
  component: Anchor,
  tags: ["autodocs"],
  parameters: {
    layout: "centered",
    decoratorType: "simple-routing",
  },
};

export default meta;

type Story = StoryObj<typeof Anchor>;

export const Default: Story = {
  args: {
    href: "#",
    children: "Internal link",
    external: false,
  },
};

export const External: Story = {
  args: {
    href: "https://example.com",
    children: "External link",
    external: true,
  },
};

export const WithClassName: Story = {
  args: {
    href: "#",
    children: "Styled link",
    className: "text-primary hover:text-blue-800 underline",
    external: false,
  },
};
