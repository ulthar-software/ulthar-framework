import { clx } from "../../utils/styles/clx.ts";
import { Icon } from "./icon.tsx";

export interface LoadingProps {
  className?: string;
}

export function LoadingSpinner({ className }: LoadingProps) {
  return (
    <div
      className={clx(
        "flex justify-center items-center text-3xl p-2",
        className,
      )}
    >
      <Icon className="animate-spin" name="bx-loader-alt" />
    </div>
  );
}
