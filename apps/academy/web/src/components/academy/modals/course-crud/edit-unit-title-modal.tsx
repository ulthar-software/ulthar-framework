import type { Infer } from "@fabric/core";
import { exhaustiveCheck, type UUID } from "@fabric/core";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form } from "../../../forms/form.tsx";
import { FormButton, Input } from "../../../forms/index.ts";
import { Button } from "../../../ui/button.tsx";
import { unitSchema } from "./schemas.ts";

interface EditUnitTitleModalProps {
  unitId: UUID;
  currentTitle: string;
  closeModal: () => void;
  refreshUnit: () => Promise<void>;
}

export function EditUnitTitleModal({
  unitId,
  currentTitle,
  closeModal,
  refreshUnit,
}: EditUnitTitleModalProps) {
  // Mutation to update unit title
  const changeUnitTitleCommand = useRPC("changeUnitTitle");

  async function handleSubmit(data: Infer<typeof unitSchema>) {
    const result = await changeUnitTitleCommand({
      title: data.title,
      unitId,
    });

    if (result.isError()) {
      const error = result.value;

      switch (error._tag) {
        case "UnitNotFoundError": {
          showErrorToast("Unidad no encontrada");
          return;
        }
        case "UnexpectedError": {
          showErrorToast("El título es demasiado corto");
          return;
        }
        default: {
          return exhaustiveCheck(error);
        }
      }
    }

    // Refresh the unit and close the modal
    void refreshUnit();
    closeModal();
  }

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <Form
        onSubmit={handleSubmit}
        schema={unitSchema}
        initialValue={{ title: currentTitle }}
        className="space-y-4"
      >
        <Input label="Título" type="text" name="title" />

        <div className="flex justify-end space-x-2">
          <Button
            type="button"
            onClick={closeModal}
            className="bg-dark-alt text-gray-300"
          >
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white">Guardar</FormButton>
        </div>
      </Form>
    </div>
  );
}
