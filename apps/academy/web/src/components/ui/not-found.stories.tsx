import type { Meta, StoryObj } from "@storybook/react";
import { NotFoundPage } from "./not-found.tsx";

const meta: Meta<typeof NotFoundPage> = {
  component: NotFoundPage,
  title: "Components/UI/NotFound",
  parameters: {
    layout: "fullscreen",
    decoratorType: "full-providers",
  },
  tags: ["autodocs"],
};
export default meta;

type Story = StoryObj<typeof meta>;

export const Default: Story = {
  args: {},
};

export const CustomMessage: Story = {
  args: {
    title: "Recurso no disponible",
    message:
      "El recurso que estás buscando no está disponible en este momento. Intenta nuevamente más tarde.",
  },
};

export const CourseNotFound: Story = {
  args: {
    title: "Curso no encontrado",
    message:
      "El curso que estás buscando no existe o no tienes permisos para verlo.",
  },
};
