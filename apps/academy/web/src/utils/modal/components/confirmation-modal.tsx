import { Button } from "../../../components/ui/button.tsx";

export interface ConfirmationModalProps {
  closeModal: () => void;
  message: string;
  onConfirm?: () => void;
  onCancel?: () => void;
}

export function ConfirmationModal({
  message,
  closeModal,
  onConfirm,
  onCancel,
}: ConfirmationModalProps) {
  return (
    <article className="bg-dark-alt rounded p-4 flex flex-col gap-2 max-w-md w-11/12">
      <p className="p-4">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button
          onClick={() => {
            onCancel?.();
            closeModal();
          }}
        >
          Cancelar
        </Button>
        <Button
          onClick={() => {
            onConfirm?.();
            closeModal();
          }}
        >
          Confirmar
        </Button>
      </div>
    </article>
  );
}
