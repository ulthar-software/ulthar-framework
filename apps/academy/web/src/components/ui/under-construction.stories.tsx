import type { Meta, StoryObj } from "@storybook/react";
import { UnderConstructionPage } from "./under-construction.tsx";

const meta: Meta<typeof UnderConstructionPage> = {
  component: UnderConstructionPage,
  title: "Components/UI/UnderConstruction",
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
    title: "Sección en desarrollo",
    message:
      "Esta sección está siendo desarrollada actualmente. Vuelve a visitarla pronto para ver las nuevas funcionalidades.",
  },
};

export const ModuleUnderConstruction: Story = {
  args: {
    title: "Módulo en desarrollo",
    message:
      "Este módulo está siendo completamente rediseñado. Todas las funcionalidades estarán disponibles próximamente.",
  },
};
