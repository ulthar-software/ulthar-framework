import type { TextSection } from "@ulthar/academy-domain";
import { MarkdownHooks } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";
import "./dark.css";
import { SectionCard } from "./section-card.tsx";

export interface TextContentSectionProps {
  section: TextSection;
}

export function TextContentSectionBlock({ section }: TextContentSectionProps) {
  const text = section.content.text as string;

  return (
    <SectionCard section={section}>
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
