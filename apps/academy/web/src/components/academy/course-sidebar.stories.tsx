import { action } from "@storybook/addon-actions";
import type { Meta, StoryObj } from "@storybook/react";
import { fakeCourse } from "../../utils/storybook/fake-course.ts";
import { fakeModuleSummary } from "../../utils/storybook/fake-module.ts";
import { CourseSidebar } from "./course-sidebar.tsx";

const meta: Meta<typeof CourseSidebar> = {
  title: "Components/Academy/CourseSidebar",
  component: CourseSidebar,
  parameters: {
    layout: "centered",
    pageLayout: "simple-routing",
  },
};

export default meta;

type Story = StoryObj<typeof CourseSidebar>;

const mockCourseData = {
  course: fakeCourse(),
  modules: [
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
    fakeModuleSummary(),
  ],
};

export const Default: Story = {
  args: {
    courseData: mockCourseData,
    showSidebar: true,
    onCloseSidebar: action("onCloseSidebar"),
    courseId: mockCourseData.course.id,
    currentModuleId: mockCourseData.modules[0].id,
    currentUnitId: mockCourseData.modules[0].units[0].id,
  },
};

export const Hidden: Story = {
  args: {
    ...Default.args,
    showSidebar: false,
  },
};
