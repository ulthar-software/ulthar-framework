import type { MaybePromise } from "@fabric/core";
import type { Context, JSX } from "react";
import { createContext } from "react";

export interface ConfirmModalProps {
  message: string;
  onConfirm?: () => MaybePromise<void>;
  onCancel?: () => MaybePromise<void>;
  styles?: { cancelButton?: string; confirmButton?: string };
}

export interface ModalService {
  showModal: (modal: JSX.Element) => [() => void, string];
  showConfirmationModal: (props: ConfirmModalProps) => void;
  withLoadingModal: <T>(cb: () => Promise<T>) => Promise<T>;
}

export type ModalContext = Context<ModalService>;

export const ModalContext = createContext<ModalService>({
  showModal: () => [() => void 0, ""] as const,
  showConfirmationModal: () => {
    // This function is intentionally left empty
  },
  withLoadingModal<T>() {
    return Promise.resolve(void 0 as T);
  },
});
