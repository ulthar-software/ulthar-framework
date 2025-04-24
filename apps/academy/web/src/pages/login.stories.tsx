import { Result, seconds, timeout } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import { InvalidCredentialsError } from "@ulthar/academy-domain";
import Login from "./login.tsx";

const meta: Meta<typeof Login> = {
  component: Login,
  title: "Pages/Login",
  parameters: {
    layout: "fullscreen",
    pageLayout: "page",
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  parameters: {
    rpcContext: {
      login: async () => {
        await timeout(seconds(1));
        return Result.ok({
          accessToken: "token",
        });
      },
    },
  },
};

export const Error: Story = {
  parameters: {
    rpcContext: {
      login: async () => {
        await timeout(seconds(1));
        return Result.failWith(new InvalidCredentialsError());
      },
    },
  },
};
