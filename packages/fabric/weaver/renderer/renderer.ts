import { WeaverDocument } from "../document.ts";
import {
  WeaverElement,
  WeaverElementAttributes,
  WeaverTextElement,
} from "../element.ts";

export interface Renderer {
  renderView: (document: WeaverDocument) => void;
  updateView: (document: WeaverDocument) => void;
}

export class HTMLRenderer {
  private currentDocument: WeaverDocument | null = null;

  constructor(private document: Document) {}

  updateView(newDocument: WeaverDocument): void {
    if (this.currentDocument === null) {
      this.currentDocument = newDocument;
      //TODO: Do initial render
      return;
    }

    //TODO: Compare newDocument with currentDocument
    //TODO: Update the view
  }
}

export function renderElement(
  element: WeaverElement,
): HTMLElement | Text {
  if (isTextElement(element)) {
    return document.createTextNode(element.value);
  }

  const el = document.createElement(element.tag);

  for (const [key, value] of Object.entries(element.attrs)) {
    el.setAttribute(key, value);
  }

  for (const child of element.children) {
    el.appendChild(renderElement(child));
  }

  return el;
}

function isTextElement(
  element: WeaverElement,
): element is WeaverTextElement {
  return element.tag === "text";
}

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

export function text(value: string): WeaverTextElement {
  return {
    tag: "text",
    value,
  };
}

export function h1(
  attrs: WeaverElementAttributes,
  children: WeaverElement[],
) {
  return {
    tag: "h1",
    attrs,
    children,
  };
}
export function h2(
  attrs: WeaverElementAttributes,
  children: WeaverElement[],
) {
  return {
    tag: "h2",
    attrs,
    children,
  };
}
