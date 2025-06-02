import type { JSX, PropsWithChildren } from "react";
import { Fragment, useCallback, useState } from "react";
import { ConfirmationModal } from "./components/confirmation-modal.tsx";
import { LoadingModal } from "./components/loading-modal.tsx";
import type { ConfirmModalProps } from "./modal-context.tsx";
import { ModalContext } from "./modal-context.tsx";

export interface Modal {
  id: string;
  modal: JSX.Element;
}

export function ModalProvider({ children }: PropsWithChildren) {
  const [modals, setModals] = useState<Modal[]>([]);

  function addModal(newModal: JSX.Element) {
    const id = crypto.randomUUID();
    setModals((prev) => [...prev, { id, modal: newModal }]);
    return id;
  }

  function closeModal(id: string) {
    setModals((prevModals) => prevModals.filter((modal) => modal.id !== id));
  }

  const showConfirmationModal = useCallback((props: ConfirmModalProps) => {
    const id = addModal(
      <ConfirmationModal
        {...props}
        closeModal={() => {
          closeModal(id);
        }}
      />,
    );
    return id;
  }, []);

  return (
    <ModalContext.Provider
      value={{
        showModal: (modal: JSX.Element) => {
          const id = addModal(modal);
          return [
            () => {
              closeModal(id);
            },
            id,
          ] as const;
        },
        showConfirmationModal,
        withLoadingModal: async (cb) => {
          const id = addModal(<LoadingModal />);
          try {
            return await cb();
          } finally {
            closeModal(id);
          }
        },
      }}
    >
      {children}
      {modals.length > 0 && (
        <div className="fixed top-0 left-0 right-0 bottom-0 z-50 w-screen bg-black/50 flex justify-center items-center">
          {modals.map((modal) => {
            return <Fragment key={modal.id}>{modal.modal}</Fragment>;
          })}
        </div>
      )}
    </ModalContext.Provider>
  );
}
