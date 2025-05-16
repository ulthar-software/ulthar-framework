import { type UUID } from "@fabric/core";
import { ResourceTypeValues } from "@ulthar/academy-domain";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { TagSelect } from "../../../forms/components/tag-select.tsx";
import { Form, FormButton, Input, Select } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";
import type { AddResourceToCoursePayload } from "./schemas.ts";
import { addResourceToCourseSchema } from "./schemas.ts";

export interface AddResourceModalProps {
  courseId: UUID;
  closeModal: () => void;
  refresh: () => Promise<void>;
}

export function AddResourceModal({
  courseId,
  closeModal,
  refresh,
}: AddResourceModalProps) {
  const addResourceCommand = useRPC("addResourceToCourse");

  const handleAddResource = async (
    data: AddResourceToCoursePayload,
  ): Promise<void> => {
    const result = await addResourceCommand({
      courseId,
      ...data,
    });

    if (result.isError()) {
      showErrorToast(
        "Hubo un error al agregar la unidad. Por favor, inténtalo de nuevo más tarde.",
      );
      return;
    }

    void refresh();

    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Agregar nueva unidad</h2>
      <Form
        schema={addResourceToCourseSchema}
        onSubmit={handleAddResource}
        className="flex flex-col gap-4"
      >
        <Input name="title" type="text" label="Título del recurso" />
        <Input name="description" type="text" label="Descripción del recurso" />
        <Input name="url" type="text" label="URL del recurso" />
        <Select
          name="type"
          label="Tipo de recurso"
          options={ResourceTypeValues.map((type) => ({
            value: type,
            label: type,
          }))}
        />

        <TagSelect name="tagIds" label="Etiquetas" />

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
