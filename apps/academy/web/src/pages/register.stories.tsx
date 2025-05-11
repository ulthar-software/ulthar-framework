import { Result, seconds, timeout, UnexpectedError } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import { InvalidInviteCodeError } from "@ulthar/academy-domain";
import Register from "./register.tsx";

const meta: Meta<typeof Register> = {
  component: Register,
  title: "Pages/Register",
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
      registerUser: async () => {
        await timeout(seconds(1));
        return Result.ok({ userId: "new-user-id" });
      },
    },
    route: {
      path: "/register",
      query: {
        email: "user@example.com",
        code: "ABC123",
      },
    },
  },
};

export const InvalidSearchParams: Story = {
  parameters: {
    rpcContext: {
      registerUser: async () => {
        await timeout(seconds(1));
        return Result.failWith(new InvalidInviteCodeError());
      },
    },
    route: {
      path: "/register",
      query: {
        email: "banana",
        code: "invite-code",
      },
    },
  },
};

export const InvalidCodeOrEmail: Story = {
  parameters: {
    rpcContext: {
      registerUser: async () => {
        await timeout(seconds(1));
        return Result.failWith(new InvalidInviteCodeError());
      },
    },
    route: {
      path: "/register",
      query: {
        email: "user@example.com",
        code: "ABC123",
      },
    },
  },
};

export const UnexpectedErrorWhileRegistering: Story = {
  parameters: {
    rpcContext: {
      registerUser: async () => {
        await timeout(seconds(1));
        return Result.failWith(new UnexpectedError());
      },
    },
    route: {
      path: "/register",
      query: {
        email: "user@example.com",
        code: "ABC123",
      },
    },
  },
};
