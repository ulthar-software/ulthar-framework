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
   * The style of the button.
   * @default "raised"
   */
  flavor?: "raised" | "outline" | "clear";
  /**
   * The color of the button.
   * @default "none"
   */
  color?: "primary" | "danger" | "success" | "warning" | "none";

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
  flavor = "raised",
  color = "none",
}: PropsWithChildren<ButtonProps>) {
  return (
    <button
      type={type}
      className={clx(
        "p-2 flex justify-center items-center gap-2 rounded cursor-pointer",
        (flavor === "raised" || flavor === "outline") && " hover:shadow-md",
        flavor === "raised" && "shadow-md",
        flavor === "outline" && "border border-slate-600",
        flavor === "raised" && color === "primary" && "bg-primary",
        flavor === "raised" && color === "danger" && "bg-danger",
        flavor === "raised" && color === "success" && "bg-success",
        flavor === "raised" && color === "warning" && "bg-warning",
        flavor === "clear" && color == "primary" && "text-primary",
        flavor === "clear" && color === "danger" && "text-danger",
        flavor === "clear" && color === "success" && "text-success",
        flavor === "clear" && color === "warning" && "text-warning",
        flavor === "outline" &&
          color === "primary" &&
          "text-primary !border-primary",
        flavor === "outline" &&
          color === "danger" &&
          "text-danger !border-danger",
        flavor === "outline" &&
          color === "success" &&
          "text-success !border-success",
        flavor === "outline" &&
          color === "warning" &&
          "text-warning !border-warning",
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
