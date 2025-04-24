import type { PropsWithChildren } from "react";

export function PageContent({ children }: PropsWithChildren) {
  return (
    <section className="grow w-full max-w-7xl mx-auto px-4 py-8">
      {children}
    </section>
  );
}
