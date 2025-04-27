import type { Context, JSX } from "react";
import { createContext } from "react";

export interface ModalService {
  showModal: (modal: JSX.Element) => [() => void, string];
  showConfirmationModal: (
    message: string,
    onConfirm?: () => void,
    onCancel?: () => void,
  ) => void;
  withLoadingModal: <T>(cb: () => Promise<T>) => Promise<T>;
}

export type ModalContext = Context<ModalService>;

export const ModalContext = createContext<ModalService>({
  showModal: () => [() => void 0, ""] as const,
  showConfirmationModal: () => void 0,
  withLoadingModal<T>() {
    return Promise.resolve(void 0 as T);
  },
});
