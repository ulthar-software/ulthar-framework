import { Result, seconds, timeout, UnexpectedError } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fakeCourse } from "../../../utils/storybook/fake-course.ts";
import { fakeModuleSummary } from "../../../utils/storybook/fake-module.ts";
import { fakeResource } from "../../../utils/storybook/fake-resource.ts";
import { fakeUnitWithSections } from "../../../utils/storybook/fake-unit.ts";
import CourseView from "./index.tsx";

const meta: Meta<typeof CourseView> = {
  component: CourseView,
  title: "Pages/CourseView",
  parameters: {
    layout: "fullscreen",
    pageLayout: "full-providers",
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

const mockResources = {
  resources: [
    fakeResource({
      title: "Clean Code: A Handbook of Agile Software Craftsmanship",
      description:
        "This book is a must read for any developer looking to improve the readability and maintainability of their code.",
    }),
    fakeResource({
      title: "Introduction to React",
      description:
        "A comprehensive video tutorial covering the basic concepts of React.",
    }),
    fakeResource({
      title: "TypeScript Documentation",
      description: "Official TypeScript documentation reference.",
    }),
    fakeResource({
      title: "Functional Programming Principles",
      description:
        "Key concepts in functional programming that every developer should know.",
    }),
    fakeResource({
      title: "Closure in JavaScript",
      description:
        "Understanding the closure concept in JavaScript and how it affects scoping.",
    }),
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
      getResourcesByUnitTags: async () => {
        await timeout(seconds(1));
        return Result.ok(mockResources);
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
      getResourcesByUnitTags: async () => {
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
      getResourcesByUnitTags: async () => {
        await timeout(seconds(1));
        return Result.failWith(new UnexpectedError("Error fetching resources"));
      },
    },
    user: {
      user: "id",
      permissions: ["VIEW_COURSE"],
    },
  },
};
