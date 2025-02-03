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

export interface WeaverElementAttributes {
  class?: string;
  id?: string;
}
