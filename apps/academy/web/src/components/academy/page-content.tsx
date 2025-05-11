import type { PropsWithChildren } from "react";
import { clx } from "../../utils/styles/clx.ts";

export interface PageContentProps {
  className?: string;
}

export function PageContent({
  children,
  className,
}: PropsWithChildren<PageContentProps>) {
  return (
    <section
      className={clx(
        "grow w-full max-w-7xl mx-auto px-4 py-8 relative",
        className,
      )}
    >
      {children}
    </section>
  );
}
