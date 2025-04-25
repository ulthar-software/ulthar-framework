import type { ContentSection } from "@ulthar/academy-domain";
import type { PropsWithChildren } from "react";

export interface SectionCardProps {
  section: ContentSection;
}

export function SectionCard({
  section,
  children,
}: PropsWithChildren<SectionCardProps>) {
  return (
    <div className="bg-dark-alt p-6 rounded-lg shadow-md">
      <h3 className="text-2xl font-bold text-white mb-3">{section.title}</h3>
      {children}
    </div>
  );
}
