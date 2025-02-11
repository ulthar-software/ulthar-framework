import { diffObject, type ObjectDiff } from "@fabric/core";
import type { WeaverElement, WeaverHTMLElement } from "./element.js";
import type { GlobalAttributes } from "./elements/global-attributes.js";

export interface WeaverElementDiff {
  attrs?: ObjectDiff<GlobalAttributes>;
  children?: (WeaverElementDiff | WeaverElement)[];
  text?: string;
}

export function diffElements(
  a: WeaverElement | undefined,
  b: WeaverElement,
): WeaverElementDiff | WeaverElement {
  if (!a) {
    return b;
  }

  if (a.tag !== b.tag) {
    return b;
  }

  if (a.tag === "text" && b.tag === "text") {
    if (a.text !== b.text) {
      return { text: b.text };
    }
    return {};
  }

  a = a as WeaverHTMLElement;
  b = b as WeaverHTMLElement;

  return {
    attrs: diffObject(a.attrs, b.attrs),
    children: b.children.map((child, i) => diffElements(a.children[i], child)),
  };
}
