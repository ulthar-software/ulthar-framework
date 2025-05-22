import { MarkdownHooks } from "react-markdown";
import rehypeHighlight from "rehype-highlight";
import remarkGfm from "remark-gfm";

import "./dark.css";

export interface MarkdownContentProps {
  content: string;
}

export function MarkdownContent({ content }: MarkdownContentProps) {
  return (
    <div className="markdown-content">
      <MarkdownHooks
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeHighlight, {}]]}
      >
        {content}
      </MarkdownHooks>
    </div>
  );
}
