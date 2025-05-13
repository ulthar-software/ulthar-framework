import type { UUID } from "@fabric/core";
import type { NavigateFunction } from "react-router";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { TagSelect } from "../../../forms/components/tag-select.tsx";
import { Form, FormButton, Input } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";
import { unitSchema } from "./schemas.ts";

export interface AddUnitModalProps {
  navigate: NavigateFunction;
  courseId: UUID;
  moduleId: UUID;
  closeModal: () => void;
  refreshCourse: () => Promise<void>;
}

export function AddUnitModal({
  courseId,
  moduleId,
  closeModal,
  navigate,
  refreshCourse,
}: AddUnitModalProps) {
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

    const unitId = result.unwrapOrThrow().unitId;

    // Navigate to the new unit page
    void navigate(`/course/${courseId}?unitId=${unitId}`);

    void refreshCourse();

    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Agregar nueva unidad</h2>
      <Form
        schema={unitSchema}
        onSubmit={handleAddUnit}
        className="flex flex-col gap-4"
      >
        <Input name="title" type="text" label="Título de la unidad" />

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
