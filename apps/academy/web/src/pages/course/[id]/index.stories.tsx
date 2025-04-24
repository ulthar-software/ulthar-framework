import { Result, seconds, timeout } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fakeCourse } from "../../../utils/storybook/fake-course.ts";
import { fakeModuleSummary } from "../../../utils/storybook/fake-module.ts";
import CourseView from "./index.tsx";

const meta: Meta<typeof CourseView> = {
  component: CourseView,
  title: "Pages/CourseView",
  parameters: {
    layout: "fullscreen",
    pageLayout: "page",
    nextjs: {
      router: {
        query: { id: "mock-course-id" },
      },
    },
  },
};
export default meta;

type Story = StoryObj<typeof meta>;

// Create a mock course with more detailed info
const mockCourseData = {
  course: fakeCourse(),
  modules: [
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
  ],
};

export const Default: Story = {
  parameters: {
    rpcContext: {
      getCourseDetails: async () => {
        await timeout(seconds(1));
        return Result.ok(mockCourseData);
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
      getCourseDetails: async () => {
        return new Promise(() => void 0);
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};
