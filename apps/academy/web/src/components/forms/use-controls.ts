import { useContext, useState } from "react";
import { FormContext } from "./form-context.ts";

export interface FormControls<T> {
  updateRequest: (value: T) => void;
  shouldShowError: boolean;
  errorMessage: string | undefined;
  value: T | undefined;
  setIsTouched: (isTouched: boolean) => void;
  isLoading: boolean;
}

export function useControls<T>(name: string): FormControls<T> {
  const [isTouched, setIsTouched] = useState(false);

  const formContext = useContext(FormContext);

  function updateRequest(value: T) {
    if (!isTouched) {
      setIsTouched(true);
    }
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-explicit-any
    formContext.updateFormValue(name, value as any);
  }

  const shouldShowError = !!(
    (formContext.isTouched || isTouched) &&
    formContext.errors?.errors[name]
  );

  return {
    updateRequest,
    shouldShowError,
    errorMessage: formContext.errors?.errors[name]?.message ?? undefined,
    value: formContext.value[name] as T,
    setIsTouched,
    isLoading: formContext.isLoading,
  };
}
