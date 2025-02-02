export type WeaverElement = WeaverHTMLElement | WeaverTextElement;

export interface WeaverHTMLElement {
  tag: string;
  attrs: WeaverElementAttributes;
  children: WeaverElement[];
}

export interface WeaverTextElement {
  tag: "text";
  value: string;
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

export interface WeaverElementAttributes {
  class?: string;
  id?: string;
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
