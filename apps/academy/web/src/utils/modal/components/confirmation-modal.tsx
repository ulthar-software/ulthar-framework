import type { MaybePromise } from "@fabric/core";
import { useState } from "react";
import { Button } from "../../../components/ui/button.tsx";
import { LoadingSpinner } from "../../../components/ui/loading-spinner.tsx";

export interface ConfirmationModalProps {
  closeModal: () => void;
  message: string;
  onConfirm?: () => MaybePromise<void>;
  onCancel?: () => MaybePromise<void>;
  styles?: {
    cancelButton?: string;
    confirmButton?: string;
  };
}

export function ConfirmationModal({
  message,
  closeModal,
  onConfirm,
  onCancel,
  styles,
}: ConfirmationModalProps) {
  const [isHandling, setIsHandling] = useState<"confirm" | "cancel" | null>();

  async function handleCancel() {
    setIsHandling("cancel");
    if (onCancel) {
      await onCancel();
    }
    setIsHandling(null);
    closeModal();
  }

  async function handleConfirm() {
    setIsHandling("confirm");
    if (onConfirm) {
      await onConfirm();
    }
    setIsHandling(null);
    closeModal();
  }
  return (
    <article className="bg-dark-alt rounded p-4 flex flex-col gap-2 max-w-md w-11/12">
      <p className="p-4">{message}</p>
      <div className="flex gap-2 justify-end">
        <Button
          onClick={() => {
            void handleCancel();
          }}
          disabled={!!isHandling}
          className={styles?.cancelButton}
        >
          {isHandling === "cancel" && <LoadingSpinner />}
          Cancelar
        </Button>
        <Button
          onClick={() => {
            void handleConfirm();
          }}
          disabled={!!isHandling}
          className={styles?.confirmButton}
        >
          {isHandling === "confirm" && <LoadingSpinner />}
          Confirmar
        </Button>
      </div>
    </article>
  );
}
