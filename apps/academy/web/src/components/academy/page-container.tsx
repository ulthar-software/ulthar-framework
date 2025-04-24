import type { PropsWithChildren } from "react";

export function PageContainer({ children }: PropsWithChildren) {
  return <main className="flex flex-col min-h-screen">{children}</main>;
}
