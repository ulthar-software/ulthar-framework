import { useContext } from "react";
import { ModalContext } from "./modal-context.tsx";

export function useModal() {
  return useContext(ModalContext);
}
