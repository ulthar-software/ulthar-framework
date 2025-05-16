import type { Infer } from "@fabric/core";
import { JSONExt } from "@fabric/core";
import type { TaggedContentSection } from "@ulthar/academy-domain";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input, TextArea } from "../../../forms/index";
import { Button } from "../../../ui/button";
import {
  quizContentSchema,
  quizSectionSchema,
  textSectionSchema,
  videoSectionSchema,
} from "./schemas.ts";

export interface EditSectionModalProps {
  section: TaggedContentSection;
  closeModal: () => void;
  refreshUnit: () => Promise<void>;
}

export function EditSectionModal({
  section,
  closeModal,
  refreshUnit,
}: EditSectionModalProps) {
  const editTextSectionCommand = useRPC("editTextSectionContent");
  const editVideoSectionCommand = useRPC("editVideoSectionContent");
  const editQuizSectionCommand = useRPC("editQuestionnaireSectionContent");

  const handleEditTextSection = async (
    data: Infer<typeof textSectionSchema>,
  ): Promise<void> => {
    const result = await editTextSectionCommand({
      sectionId: section.id,
      text: data.text,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al actualizar la sección de texto. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    await refreshUnit();
    closeModal();
  };

  const handleEditVideoSection = async (
    data: Infer<typeof videoSectionSchema>,
  ): Promise<void> => {
    const result = await editVideoSectionCommand({
      sectionId: section.id,
      videoUrl: data.videoUrl,
      title: data.title,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al actualizar la sección de video. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    await refreshUnit();
    closeModal();
  };

  const handleEditQuizSection = async (
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

    const result = await editQuizSectionCommand({
      sectionId: section.id,
      title: data.title,
      ...questionData.unwrapOrThrow(),
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al actualizar el cuestionario. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    await refreshUnit();
    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">
        {section.type === "TEXT" && "Editar sección de texto"}
        {section.type === "VIDEO" && "Editar sección de video"}
        {section.type === "QUESTIONNAIRE" && "Editar cuestionario"}
      </h2>

      {section.type === "TEXT" && (
        <Form
          schema={textSectionSchema}
          onSubmit={handleEditTextSection}
          className="flex flex-col gap-4"
          initialValue={{ text: section.content.text }}
        >
          <TextArea name="text" label="Contenido" />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={closeModal} className="bg-gray-500 text-white">
              Cancelar
            </Button>
            <FormButton className="bg-primary text-white">Guardar</FormButton>
          </div>
        </Form>
      )}

      {section.type === "VIDEO" && (
        <Form
          schema={videoSectionSchema}
          onSubmit={handleEditVideoSection}
          className="flex flex-col gap-4"
          initialValue={{
            title: section.title,
            videoUrl: section.content.videoUrl,
          }}
        >
          <Input name="title" type="text" label="Título de la sección" />
          <Input name="videoUrl" type="text" label="URL del video" />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={closeModal} className="bg-gray-500 text-white">
              Cancelar
            </Button>
            <FormButton className="bg-primary text-white">Guardar</FormButton>
          </div>
        </Form>
      )}

      {section.type === "QUESTIONNAIRE" && (
        <Form
          schema={quizSectionSchema}
          onSubmit={handleEditQuizSection}
          className="flex flex-col gap-4"
          initialValue={{
            title: section.title,
            content: JSONExt.stringify(section.content).unwrapOrThrow(),
          }}
        >
          <Input name="title" type="text" label="Título del cuestionario" />
          <TextArea name="content" label="Cuestionario" />
          <div className="flex justify-end gap-2 mt-2">
            <Button onClick={closeModal} className="bg-gray-500 text-white">
              Cancelar
            </Button>
            <FormButton className="bg-primary text-white">Guardar</FormButton>
          </div>
        </Form>
      )}
    </div>
  );
}
