import type { TaggedTextSection } from "@ulthar/academy-domain";
import { MarkdownContent } from "../../ui/markdown-content.tsx";
import { SectionCard } from "./section-card.tsx";

export interface TextContentSectionProps {
  section: TaggedTextSection;
  refreshUnit: () => Promise<void>;
}

export function TextContentSectionBlock({
  section,
  refreshUnit,
}: TextContentSectionProps) {
  const text = section.content.text;

  return (
    <SectionCard section={section} refreshUnit={refreshUnit}>
      <MarkdownContent content={text} />
    </SectionCard>
  );
}
