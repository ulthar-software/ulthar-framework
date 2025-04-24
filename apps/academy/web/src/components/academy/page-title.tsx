import type { PropsWithChildren } from "react";

export function PageTitle({ children }: PropsWithChildren) {
  return <h2 className="text-2xl font-bold text-primary mb-6">{children}</h2>;
}
