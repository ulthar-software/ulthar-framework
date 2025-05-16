import type { UUID } from "@fabric/core";
import { TypesWithTags } from "@ulthar/academy-domain";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { TagSelect } from "../../../forms/components/tag-select.tsx";
import { Form, FormButton } from "../../../forms/index";
import { Button } from "../../../ui/button.tsx";
import type { AddTagsPayload } from "./schemas.ts";
import { addTagsSchema } from "./schemas.ts";

export interface AddTagsToUnitModalProps {
  unitId: UUID;
  unitTags: { id: UUID; name: string }[];
  closeModal: () => void;
  refresh: () => Promise<void>;
}

export function AddTagsToUnitModal({
  closeModal,
  unitId,
  unitTags,
  refresh,
}: AddTagsToUnitModalProps) {
  const addTagToUnitCommand = useRPC("addTagToUnit");

  const handleAddTagsToUnit = async ({
    tagIds,
  }: AddTagsPayload): Promise<void> => {
    for (const tagId of tagIds) {
      const result = await addTagToUnitCommand({
        unitId,
        tagId,
      });

      if (result.isError()) {
        showErrorToast(
          "Hubo un error al agregar la etiqueta. Por favor, inténtalo de nuevo más tarde.",
        );
        void refresh();
        closeModal();
        return;
      }
    }
    void refresh();
    closeModal();
  };

  return (
    <div className="bg-dark-alt rounded p-4 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-lg font-bold">Agregar etiquetas</h2>
      <p className="text-sm text-gray-400">
        Selecciona las etiquetas que deseas agregar a la unidad.
      </p>

      <div className="flex flex-wrap gap-2 mt-2">
        {unitTags.map((tag) => (
          <span
            key={tag.id}
            className="bg-gray-800 text-white px-2 py-1 rounded-md"
          >
            {tag.name}
          </span>
        ))}
        {unitTags.length === 0 && (
          <span className="text-gray-500">
            No hay etiquetas asignadas aún a esta unidad
          </span>
        )}
      </div>

      <Form
        schema={addTagsSchema}
        onSubmit={handleAddTagsToUnit}
        className="flex flex-col gap-4"
      >
        <TagSelect
          name="tagIds"
          label="Etiquetas"
          idToFilter={unitId}
          typeToFilter={TypesWithTags.UNIT}
        />

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
