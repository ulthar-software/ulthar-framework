import { Result, seconds, timeout, UnexpectedError } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fakeCourse } from "../../../utils/storybook/fake-course.ts";
import { fakeModuleSummary } from "../../../utils/storybook/fake-module.ts";
import { fakeUnitWithSections } from "../../../utils/storybook/fake-unit.ts";
import CourseView from "./index.tsx";

const meta: Meta<typeof CourseView> = {
  component: CourseView,
  title: "Pages/CourseView",
  parameters: {
    layout: "fullscreen",
    pageLayout: "page",
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
      getUnitWithSections: async () => {
        await timeout(seconds(2));
        return Result.ok(
          fakeUnitWithSections({
            id: mockCourseData.modules[0].units[0].id,
            moduleId: mockCourseData.modules[0].id,
          }),
        );
      },
    },
    route: {
      path: "/course/:id",
      params: {
        id: mockCourseData.course.id,
      },
      query: {
        unitId: mockCourseData.modules[0].units[0].id,
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
      getUnitWithSections: async () => {
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
      getCourseDetails: async () => {
        await timeout(seconds(1));
        return Result.failWith(
          new UnexpectedError("Error fetching course details"),
        );
      },
      getUnitWithSections: async () => {
        await timeout(seconds(2));
        return Result.failWith(
          new UnexpectedError("Error fetching unit details"),
        );
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};
