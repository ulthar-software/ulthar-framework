import type { PropsWithChildren } from "react";
import { useContext } from "react";
import type { ButtonProps } from "../../ui/button.tsx";
import { Button } from "../../ui/button.tsx";
import { LoadingSpinner } from "../../ui/loading-spinner.tsx";
import { FormContext } from "../form-context.ts";

export function FormButton({
  children,
  type = "submit",
  ...buttonProps
}: PropsWithChildren<Omit<ButtonProps, "onClick">>) {
  const { isLoading } = useContext(FormContext);

  return (
    <Button
      disabled={isLoading}
      type={type}
      onClick={() => void 0}
      {...buttonProps}
    >
      {isLoading && <LoadingSpinner />}
      {children}
    </Button>
  );
}
