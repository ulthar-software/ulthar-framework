import type { UUID } from "@fabric/core";
import { Field, Schema } from "@fabric/core";
import { useRPC } from "../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input } from "../forms/index";
import { Button } from "../ui/button";

export interface AddModuleModalProps {
  courseId: UUID;
  closeModal: () => void;
}

const addModuleSchema = new Schema({
  title: Field.string({ minLength: 3 }),
});

export function AddModuleModal({ courseId, closeModal }: AddModuleModalProps) {
  const addModuleCommand = useRPC("addModuleToCourse");

  const handleAddModule = async (data: { title: string }): Promise<void> => {
    const result = await addModuleCommand({
      courseId,
      title: data.title,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al agregar el módulo. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Agregar nuevo módulo</h2>
      <Form
        schema={addModuleSchema}
        onSubmit={handleAddModule}
        className="flex flex-col gap-4"
      >
        <Input name="title" type="text" label="Título del módulo" />
        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} className="bg-gray-500 text-white">
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white">Agregar</FormButton>
        </div>
      </Form>
    </div>
  );
}
