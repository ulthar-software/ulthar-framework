import type { MaybePromise } from "@fabric/core";
import type { PropsWithChildren } from "react";
import { clx } from "../../utils/styles/clx.ts";

export interface ButtonProps {
  /**
   * Whether the button is disabled.
   */
  disabled?: boolean;
  /**
   * The hover text of the button.
   */
  title?: string;
  /**
   * The type of the button.
   * @default "button"
   */
  type?: "button" | "submit" | "reset";

  /**
   * The class name of the component.
   */
  className?: string;

  /**
   * The click handler of the component.
   */
  onClick: () => MaybePromise<void>;
}

/**
 * The base button component.
 *
 *
 */
export function Button({
  className,
  disabled,
  onClick,
  children,
  title,
  type = "button",
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      className={clx(
        "p-2 flex justify-center items-center gap-2 rounded cursor-pointer hover:shadow-md",
        disabled && "opacity-50 cursor-not-allowed",
        className,
      )}
      disabled={disabled}
      onClick={(evt) => {
        evt.stopPropagation();
        void onClick();
      }}
      title={title}
    >
      {children}
    </button>
  );
}
