import { Result, seconds, timeout, UnexpectedError } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import type { GetAllCoursesOutput } from "@ulthar/academy-domain";
import { fakeCourse } from "../utils/storybook/fake-course.ts";
import Home from "./index.tsx";

const meta: Meta<typeof Home> = {
  component: Home,
  title: "Pages/Home",
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
      getAllCourses: async () => {
        await timeout(seconds(1));
        return Result.ok({
          courses: [fakeCourse(), fakeCourse(), fakeCourse()],
        } as GetAllCoursesOutput);
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};

export const Loading: Story = {
  parameters: {
    rpcContext: {
      getAllCourses: async () => {
        return new Promise(() => void 0);
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};

export const Error: Story = {
  parameters: {
    rpcContext: {
      getAllCourses: async () => {
        await timeout(seconds(1));
        return Result.failWith(new UnexpectedError());
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};
export const NoCourses: Story = {
  parameters: {
    rpcContext: {
      getAllCourses: async () => {
        await timeout(seconds(1));
        return Result.ok({
          courses: [],
        } as GetAllCoursesOutput);
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};
