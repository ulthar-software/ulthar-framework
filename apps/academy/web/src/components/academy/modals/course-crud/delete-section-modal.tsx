import { Button } from "../../../ui/button.tsx";

interface DeleteSectionModalProps {
  onDelete: () => Promise<void>;
  closeModal: () => void;
}

export function DeleteSectionModal({
  onDelete,
  closeModal,
}: DeleteSectionModalProps) {
  return (
    <div className="bg-dark-alt rounded p-6 flex flex-col gap-4 max-w-md w-11/12">
      <h2 className="text-xl font-semibold text-primary">Eliminar sección</h2>
      <p className="text-gray-300">
        ¿Estás seguro de que quieres eliminar esta sección?
      </p>
      <div className="flex justify-end space-x-2 mt-4">
        <Button
          type="button"
          onClick={() => {
            closeModal();
          }}
          className="bg-gray-600 text-white hover:bg-gray-700"
        >
          Cancelar
        </Button>
        <Button
          type="button"
          onClick={async () => {
            await onDelete();
            closeModal();
          }}
          className="bg-red-600 text-white hover:bg-red-700"
        >
          Eliminar
        </Button>
      </div>
    </div>
  );
}
