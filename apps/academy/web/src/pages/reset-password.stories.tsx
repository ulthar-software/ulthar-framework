import { Result, seconds, timeout, UnexpectedError } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import ResetPassword from "./reset-password.tsx";

const meta: Meta<typeof ResetPassword> = {
  component: ResetPassword,
  title: "Pages/ResetPassword",
  parameters: {
    layout: "fullscreen",
    decoratorType: "full-providers",
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    route: {
      path: "/reset-password",
      query: {
        token: "valid-reset-token",
        email: "user@example.com",
      },
    },
    rpcContext: {
      resetPassword: async () => {
        await timeout(seconds(1));
        return Result.ok({});
      },
    },
  },
};

export const Error: Story = {
  parameters: {
    route: {
      path: "/reset-password",
      query: {
        token: "invalid-token",
        email: "user@example.com",
      },
    },
    rpcContext: {
      resetPassword: async () => {
        await timeout(seconds(1));
        return Result.failWith(new UnexpectedError());
      },
    },
  },
};

export const InvalidLink: Story = {
  parameters: {
    reactRouter: {
      searchParams: {},
    },
    rpcContext: {
      resetPassword: async () => {
        await timeout(seconds(1));
        return Result.ok({});
      },
    },
  },
};
