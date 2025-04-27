import { Result, seconds, timeout } from "@fabric/core";
import type { Meta, StoryObj } from "@storybook/react";
import { fakeResource } from "../../utils/storybook/fake-resource.ts";
import { ResourceSidebar } from "./resource-sidebar";

const meta: Meta<typeof ResourceSidebar> = {
  title: "Components/Academy/ResourceSidebar",
  component: ResourceSidebar,
  parameters: {
    layout: "centered",
    pageLayout: "full-providers",
  },
};

export default meta;

type Story = StoryObj<typeof ResourceSidebar>;

// Mock data for the storybook
const mockCourseId = "11111111-1111-1111-1111-111111111111";
const mockUnitId = "22222222-2222-2222-2222-222222222222";

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
  args: {
    courseId: mockCourseId,
    unitId: mockUnitId,
  },
  parameters: {
    rpcContext: {
      getResourcesByUnitTags: async () => {
        await timeout(seconds(1));
        return Result.ok(mockResources);
      },
    },
  },
};

export const Loading: Story = {
  args: {
    courseId: mockCourseId,
    unitId: mockUnitId,
  },
  parameters: {
    rpcContext: {
      getResourcesByUnitTags: async () => {
        return new Promise(() => void 0); // Never resolves to simulate loading
      },
    },
  },
};

export const Empty: Story = {
  args: {
    courseId: mockCourseId,
    unitId: mockUnitId,
  },
  parameters: {
    rpcContext: {
      getResourcesByUnitTags: async () => {
        await timeout(seconds(1));
        return Result.ok({ resources: [] });
      },
    },
  },
};
