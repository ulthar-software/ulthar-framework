import { exhaustiveCheck, Field, Schema } from "@fabric/core";
import type { NavigateFunction } from "react-router";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";

export interface CreateCourseModalProps {
  navigate: NavigateFunction;
  closeModal: () => void;
}

const createCourseSchema = new Schema({
  title: Field.string(),
  description: Field.string({ isOptional: true }),
});

export function CreateCourseModal({
  closeModal,
  navigate,
}: CreateCourseModalProps) {
  const createCourseCommand = useRPC("createCourse");

  const handleCreateCourse = async (data: {
    title: string;
    description?: string;
  }): Promise<void> => {
    const result = await createCourseCommand({
      title: data.title,
      description: data.description,
    });
    if (result.isError()) {
      const error = result.value;
      switch (error._tag) {
        // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
        case "UnexpectedError": {
          showErrorToast(
            "Sucedió un error inesperado. Por favor, intentá de nuevo más tarde.",
          );
          return;
        }
        default: {
          exhaustiveCheck(error._tag);
        }
      }
    }
    const { courseId } = result.unwrapOrThrow(); // Replace with actual logic
    void navigate(`/course/${courseId}`);
    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Crea un nuevo curso</h2>
      <Form
        schema={createCourseSchema}
        onSubmit={handleCreateCourse}
        className="flex flex-col gap-4"
      >
        <Input name="title" type="text" label="Nombre del curso" />
        <Input name="description" type="text" label="Descripción del curso" />
        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} className="bg-gray-500 text-white">
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white">Crear</FormButton>
        </div>
      </Form>
    </div>
  );
}
