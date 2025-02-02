import { WeaverDocument } from "../document.ts";
import { renderElement, WeaverElement } from "../element.ts";

export function renderDocument(doc: WeaverDocument): void {
  renderHead(doc.title, doc.description, doc.keywords);
  renderBody(doc.body);
}

export function renderHead(
  title: string,
  description: string,
  keywords: string[],
) {
  document.title = title;
  document.head.querySelector("meta[name=description]")?.setAttribute(
    "content",
    description,
  );
  document.head.querySelector("meta[name=keywords]")?.setAttribute(
    "content",
    keywords.join(", "),
  );
}

export function renderBody(body: WeaverElement[]) {
  document.body.append(...body.map(renderElement));
}
