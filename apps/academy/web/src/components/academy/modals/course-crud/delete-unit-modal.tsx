import type { UUID } from "@fabric/core";
import { exhaustiveCheck } from "@fabric/core";
import { useRPC } from "../../../../utils/rpc/use-rpc.ts";
import { showErrorToast } from "../../../../utils/toasts/show-error-toast.ts";
import { showSuccessToast } from "../../../../utils/toasts/show-success-toast.ts";
import { Button } from "../../../ui/button.tsx";

interface DeleteUnitModalProps {
  unitId: UUID;
  unitTitle: string;
  closeModal: () => void;
  refreshCourse: () => Promise<void>;
}

export function DeleteUnitModal({
  unitId,
  unitTitle,
  closeModal,
  refreshCourse,
}: DeleteUnitModalProps) {
  const deleteUnitCommand = useRPC("deleteUnit");

  async function handleDelete() {
    const result = await deleteUnitCommand({
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
          showErrorToast("Error inesperado al eliminar la unidad");
          return;
        }
        default: {
          return exhaustiveCheck(error);
        }
      }
    }

    showSuccessToast("Unidad eliminada exitosamente");
    await refreshCourse();
    closeModal();
  }

  return (
    <div className="bg-dark-alt rounded p-6 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-xl font-semibold text-primary">Eliminar unidad</h2>

      <p className="text-gray-300">
        ¿Estás seguro de que quieres eliminar la unidad{" "}
        <strong className="text-white">"{unitTitle}"</strong>?
      </p>

      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="button"
          onClick={closeModal}
          className="bg-gray-600 text-white hover:bg-gray-700"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={handleDelete}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
