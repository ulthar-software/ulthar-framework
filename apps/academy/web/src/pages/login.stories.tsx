import { Result } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import Login from "./login.tsx";

const meta: Meta<typeof Login> = {
  component: Login,
  title: "Pages/Login",
  parameters: {
    layout: "fullscreen",
    pageLayout: "page",
    rpcContext: {
      login: async () => {
        return Promise.resolve(
          Result.ok({
            accessToken: "token",
          }),
        );
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {};
