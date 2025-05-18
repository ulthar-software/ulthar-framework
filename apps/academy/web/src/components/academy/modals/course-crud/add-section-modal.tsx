import type { Infer } from "@fabric/core";
import { JSONExt, type UUID } from "@fabric/core";
import type { SectionType } from "@ulthar/academy-domain";
import { useState } from "react";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input, TextArea } from "../../../forms/index";
import { Button } from "../../../ui/button";
import { Icon } from "../../../ui/icon";
import {
  quizContentSchema,
  quizSectionSchema,
  textSectionSchema,
  videoSectionSchema,
} from "./schemas.ts";

export interface AddSectionModalProps {
  unitId: UUID;
  courseId: UUID;
  closeModal: () => void;
  refreshUnit: () => Promise<void>;
}

export function AddSectionModal({
  unitId,
  closeModal,
  refreshUnit,
}: AddSectionModalProps) {
  const [selectedType, setSelectedType] = useState<SectionType | null>(null);
  const addTextSectionCommand = useRPC("addTextSectionToUnit");
  const addVideoSectionCommand = useRPC("addVideoSectionToUnit");
  const addQuizSectionCommand = useRPC("addQuestionnaireSectionToUnit");

  // Handle adding a text section
  const handleAddTextSection = async (
    data: Infer<typeof textSectionSchema>,
  ): Promise<void> => {
    const result = await addTextSectionCommand({
      unitId,
      text: data.text,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al agregar la sección de texto. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    await refreshUnit();
    closeModal();
  };

  // Handle adding a video section
  const handleAddVideoSection = async (
    data: Infer<typeof videoSectionSchema>,
  ): Promise<void> => {
    const result = await addVideoSectionCommand({
      unitId,
      title: data.title,
      videoUrl: data.videoUrl,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al agregar la sección de video. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    await refreshUnit();
    closeModal();
  };

  // Handle adding a quiz section
  const handleAddQuizSection = async (
    data: Infer<typeof quizSectionSchema>,
  ): Promise<void> => {
    const questionData = JSONExt.parseWithModel(
      quizContentSchema,
      data.content,
    );

    if (questionData.isError()) {
      showErrorToast(
        "El contenido del cuestionario no es válido. Por favor, revisa el formato.",
      );
      return;
    }

    const result = await addQuizSectionCommand({
      unitId,
      title: data.title,
      ...questionData.unwrapOrThrow(),
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al agregar la sección de cuestionario. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    await refreshUnit();
    closeModal();
  };

  // Reset selection and go back to type selection
  const handleGoBack = () => {
    setSelectedType(null);
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <div className="flex justify-between items-center">
        <h2 className="text-lg font-bold">
          {selectedType === null && "Agregar nueva sección"}
          {selectedType === "TEXT" && "Agregar sección de texto"}
          {selectedType === "VIDEO" && "Agregar sección de video"}
          {selectedType === "QUESTIONNAIRE" && "Agregar cuestionario"}
        </h2>
        {selectedType !== null && (
          <Button
            onClick={handleGoBack}
            className="bg-transparent hover:bg-gray-700 p-1"
          >
            <Icon name="bx-arrow-back" className="text-white" />
          </Button>
        )}
      </div>

      {/* Section Type Selection */}
      {selectedType === null && (
        <div className="flex flex-col gap-4">
          <Button
            onClick={() => {
              setSelectedType("TEXT");
            }}
            className="bg-primary text-white p-4 flex items-center justify-between"
          >
            <span className="flex items-center">
              <Icon name="bx-text" className="mr-2 text-xl" />
              Sección de texto
            </span>
            <Icon name="bx-chevron-right" />
          </Button>

          <Button
            onClick={() => {
              setSelectedType("VIDEO");
            }}
            className="bg-primary text-white p-4 flex items-center justify-between"
          >
            <span className="flex items-center">
              <Icon name="bx-video" className="mr-2 text-xl" />
              Sección de video
            </span>
            <Icon name="bx-chevron-right" />
          </Button>

          <Button
            onClick={() => {
              setSelectedType("QUESTIONNAIRE");
            }}
            className="bg-primary text-white p-4 flex items-center justify-between"
          >
            <span className="flex items-center">
              <Icon name="bx-help-circle" className="mr-2 text-xl" />
              Cuestionario
            </span>
            <Icon name="bx-chevron-right" />
          </Button>

          <Button onClick={closeModal} className="bg-gray-500 text-white mt-2">
            Cancelar
          </Button>
        </div>
      )}

      {/* Text Section Form */}
      {selectedType === "TEXT" && (
        <Form
          schema={textSectionSchema}
          onSubmit={handleAddTextSection}
          className="flex flex-col gap-4"
        >
          <Input name="title" type="text" label="Título de la sección" />
          <TextArea name="text" label="Contenido" />

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={closeModal} className="bg-gray-500 text-white">
              Cancelar
            </Button>
            <FormButton className="bg-primary text-white">Agregar</FormButton>
          </div>
        </Form>
      )}

      {/* Video Section Form */}
      {selectedType === "VIDEO" && (
        <Form
          schema={videoSectionSchema}
          onSubmit={handleAddVideoSection}
          className="flex flex-col gap-4"
        >
          <Input name="title" type="text" label="Título de la sección" />
          <Input name="videoUrl" type="text" label="URL del video" />

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={closeModal} className="bg-gray-500 text-white">
              Cancelar
            </Button>
            <FormButton className="bg-primary text-white">Agregar</FormButton>
          </div>
        </Form>
      )}

      {/* Quiz Section Form */}
      {selectedType === "QUESTIONNAIRE" && (
        <Form
          schema={quizSectionSchema}
          onSubmit={handleAddQuizSection}
          className="flex flex-col gap-4"
        >
          <Input name="title" type="text" label="Título del cuestionario" />
          <TextArea name="content" label="Cuestionario" />

          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={closeModal} className="bg-gray-500 text-white">
              Cancelar
            </Button>
            <FormButton className="bg-primary text-white">Agregar</FormButton>
          </div>
        </Form>
      )}
    </div>
  );
}
