import type { ResourceDetails } from "@ulthar/academy-domain";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { Form, FormButton, Input, TextArea } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";
import type { EditResourcePayload } from "./schemas.ts";
import { editResourceSchema } from "./schemas.ts";

export interface EditResourceModalProps {
  resource: ResourceDetails;
  closeModal: () => void;
  refresh: () => Promise<void>;
}

export function EditResourceModal({
  resource,
  closeModal,
  refresh,
}: EditResourceModalProps) {
  const editResourceCommand = useRPC("editResource");

  const handleEditResource = async (
    data: EditResourcePayload,
  ): Promise<void> => {
    const result = await editResourceCommand({
      resourceId: resource.id,
      ...data,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al editar el recurso. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    void refresh();

    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Editar recurso</h2>
      <Form
        schema={editResourceSchema}
        onSubmit={handleEditResource}
        initialValue={resource}
        className="flex flex-col gap-4"
      >
        <Input name="title" type="text" label="Título del recurso" />
        <TextArea name="description" label="Descripción del recurso" />
        <Input name="url" type="text" label="URL del recurso" />

        <div className="flex justify-end gap-2">
          <Button onClick={closeModal} className="bg-gray-500 text-white">
            Cancelar
          </Button>
          <FormButton className="bg-primary text-white">Guardar</FormButton>
        </div>
      </Form>
    </div>
  );
}
