import { Result, seconds, timeout, UnexpectedError } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import ForgotPassword from "./forgot-password.tsx";

const meta: Meta<typeof ForgotPassword> = {
  component: ForgotPassword,
  title: "Pages/ForgotPassword",
  parameters: {
    layout: "fullscreen",
    decoratorType: "full-providers",
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    rpcContext: {
      requestPasswordReset: async () => {
        await timeout(seconds(1));
        return Result.ok({});
      },
    },
  },
};

export const Error: Story = {
  parameters: {
    rpcContext: {
      requestPasswordReset: async () => {
        await timeout(seconds(1));
        return Result.failWith(new UnexpectedError());
      },
    },
  },
};
