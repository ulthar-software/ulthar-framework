import type { UUID } from "@fabric/core";
import { Field, Schema } from "@fabric/core";
import { useRPC } from "../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input } from "../forms/index";
import { Button } from "../ui/button";

export interface AddUnitModalProps {
  moduleId: UUID;
  closeModal: () => void;
}

const addUnitSchema = new Schema({
  title: Field.string({ minLength: 3 }),
});

export function AddUnitModal({ moduleId, closeModal }: AddUnitModalProps) {
  const addUnitCommand = useRPC("addUnitToModule");

  const handleAddUnit = async (data: { title: string }): Promise<void> => {
    const result = await addUnitCommand({
      moduleId,
      title: data.title,
      tagIds: [],
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al agregar la unidad. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Agregar nueva unidad</h2>
      <Form
        schema={addUnitSchema}
        onSubmit={handleAddUnit}
        className="flex flex-col gap-4"
      >
        <Input name="title" type="text" label="Título de la unidad" />
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
