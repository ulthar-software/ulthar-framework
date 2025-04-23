import type { Meta, StoryObj } from "@storybook/react";
import { Button } from "./button.tsx";
import { Icon } from "./icon.tsx";

const meta: Meta<typeof Button> = {
  component: Button,
  title: "Components/Basic/Button",
  parameters: {
    layout: "centered",
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof meta>;
export const Raised: Story = {
  args: {
    children: "Demo Button",
    flavor: "raised",
  },
};

export const RaisedPrimary: Story = {
  args: {
    children: "Demo Button",
    flavor: "raised",
    color: "primary",
  },
};

export const WithIcon: Story = {
  args: {
    flavor: "raised",
    color: "primary",
    children: (
      <>
        <Icon name="bx-plus" /> Demo Button
      </>
    ),
  },
};

export const Clear: Story = {
  args: {
    children: "Demo Button",
    flavor: "clear",
  },
};

export const ClearPrimary: Story = {
  args: {
    children: "Demo Button",
    color: "primary",
    flavor: "clear",
  },
};

export const Outline: Story = {
  args: {
    children: "Demo Button",
    flavor: "outline",
  },
};
