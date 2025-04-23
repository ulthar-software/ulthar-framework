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
        "p-2 flex justify-center items-center gap-2 rounded",
        (flavor === "raised" || flavor === "outline") &&
          "shadow-slate-300 hover:shadow-slate-400 hover:shadow-md",
        flavor === "raised" &&
          "shadow-md shadow-slate-300 hover:shadow-slate-400",
        flavor === "outline" && "border border-slate-600",
        flavor === "raised" && color === "primary" && "bg-primary-400",
        flavor === "raised" && color === "danger" && "bg-red-400",
        flavor === "raised" && color === "success" && "bg-green-400",
        flavor === "raised" && color === "warning" && "bg-yellow-400",
        flavor === "clear" && color == "primary" && "text-primary-700",
        flavor === "clear" && color === "danger" && "text-red-700",
        flavor === "clear" && color === "success" && "text-green-700",
        flavor === "clear" && color === "warning" && "text-yellow-700",
        flavor === "outline" &&
          color === "primary" &&
          "text-primary-700 !border-primary-700",
        flavor === "outline" &&
          color === "danger" &&
          `text-red-700 !border-red-700`,
        flavor === "outline" &&
          color === "success" &&
          "text-green-700 !border-green-700",
        flavor === "outline" &&
          color === "warning" &&
          "text-yellow-700 !border-yellow-700",
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
