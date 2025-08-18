import { exhaustiveCheck, Field, Schema, type UUID } from "@fabric/core";
import type { NavigateFunction } from "react-router";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";

export interface CloneCourseModalProps {
  sourceId: UUID;
  sourceTitle: string;
  navigate: NavigateFunction;
  closeModal: () => void;
}

const cloneCourseSchema = new Schema({
  title: Field.string(),
  description: Field.string({ isOptional: true }),
});

export function CloneCourseModal({
  sourceId,
  sourceTitle,
  closeModal,
  navigate,
}: CloneCourseModalProps) {
  const cloneCourseCommand = useRPC("cloneCourse");

  const handleCloneCourse = async (data: {
    title: string;
    description?: string;
  }): Promise<void> => {
    const result = await cloneCourseCommand({
      sourceId,
      title: data.title,
      description: data.description,
    });
    if (result.isError()) {
      const error = result.value;
      switch (error._tag) {
        case "CourseNotFoundError": {
          showErrorToast("El curso original ya no está disponible.");
          return;
        }
        case "UnexpectedError": {
          showErrorToast(
            "Sucedió un error inesperado. Por favor, intentá de nuevo más tarde.",
          );
          return;
        }
        default: {
          exhaustiveCheck(error);
        }
      }
    }
    const { courseId } = result.unwrapOrThrow();
    void navigate(`/course/${courseId}`);
    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Clonar curso</h2>
      <p className="text-gray-300 text-sm">
        Creando una copia de:{" "}
        <span className="text-primary">{sourceTitle}</span>
      </p>
      <Form
        schema={cloneCourseSchema}
        onSubmit={handleCloneCourse}
        className="flex flex-col gap-4"
        initialValue={{
          title: `${sourceTitle} (copia)`,
        }}
      >
        <Input name="title" type="text" label="Nombre del nuevo curso" />
        <Input name="description" type="text" label="Descripción del curso" />
        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} className="bg-gray-500 text-white">
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white">Clonar</FormButton>
        </div>
      </Form>
    </div>
  );
}
