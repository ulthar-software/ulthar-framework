import type { TaggedTextSection } from "@ulthar/academy-domain";
import { MarkdownHooks } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "./dark.css";
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
      <div className="markdown-content text-gray-200">
        <MarkdownHooks
          remarkPlugins={[remarkGfm]}
          rehypePlugins={[rehypeHighlight]}
        >
          {text}
        </MarkdownHooks>
      </div>
    </SectionCard>
  );
}
