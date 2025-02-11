/* eslint-disable @typescript-eslint/no-unsafe-argument */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unnecessary-condition */
/* eslint-disable @typescript-eslint/no-non-null-assertion */
import type { Effect } from "@fabric/core";
import type { WeaverDocument } from "../../document.js";
import { diffElements, type WeaverElementDiff } from "../diff-elements.js";
import { isTextElement, type WeaverElement } from "../element.js";
import type { Renderer } from "../renderer.js";

export type EventRegisterFn = (
  element: WeaverElement,
  HTMLElement: HTMLElement,
  effect: () => Effect<any, any, any>,
) => void;

export class HTMLRenderer implements Renderer {
  private currentDocument: WeaverDocument | null = null;

  constructor(
    private htmlDocument: Document,
    private registerEffect: EventRegisterFn,
  ) {}

  renderView(document: WeaverDocument): void {
    if (!this.currentDocument) {
      this.currentDocument = document;
      this.renderDocument(document);
      return;
    }

    this.updateView(document);
    this.currentDocument = document;
  }

  private updateView(updatedDocument: WeaverDocument): void {
    if (updatedDocument.title !== this.currentDocument!.title) {
      this.htmlDocument.title = updatedDocument.title;
    }
    const bodyDiff = updatedDocument.body.map((element, i) => {
      return diffElements(this.currentDocument!.body[i], element);
    });
    this.applyDiff(bodyDiff);
  }

  private applyDiff(diff: (WeaverElement | WeaverElementDiff)[]): void {
    if (this.htmlDocument.body.childNodes.length > diff.length) {
      for (
        let i = this.htmlDocument.body.childNodes.length - 1;
        i >= diff.length;
        i--
      ) {
        this.htmlDocument.body.removeChild(
          this.htmlDocument.body.childNodes[i],
        );
      }
    }

    for (const [index, element] of diff.entries()) {
      if (isWeaverElement(element)) {
        this.htmlDocument.body.replaceChild(
          this.renderElement(element),
          this.htmlDocument.body.childNodes[index],
        );
      } else {
        this.applyElementDiff(
          this.htmlDocument.body.childNodes[index] as HTMLElement,
          element,
        );
      }
    }
  }

  private applyElementDiff(parent: HTMLElement, diff: WeaverElementDiff): void {
    if ("text" in diff) {
      parent.textContent = diff.text!;
      return;
    }

    if ("attrs" in diff) {
      if (diff.attrs!.set) {
        for (const [key, value] of Object.entries(diff.attrs!.set)) {
          parent.setAttribute(key, value.toString());
        }
      }

      if (diff.attrs!.remove) {
        for (const key of diff.attrs!.remove) {
          parent.removeAttribute(key);
        }
      }
    }

    if ("children" in diff) {
      if (parent.childNodes.length > diff.children!.length) {
        for (
          let i = parent.childNodes.length - 1;
          i >= diff.children!.length;
          i--
        ) {
          this.htmlDocument.body.removeChild(parent.childNodes[i]);
        }
      }
      for (const [index, child] of diff.children!.entries()) {
        if (isWeaverElement(child)) {
          parent.replaceChild(
            this.renderElement(child),
            parent.childNodes[index],
          );
        } else {
          this.applyElementDiff(parent.childNodes[index] as HTMLElement, child);
        }
      }
    }
  }

  private renderElement(element: WeaverElement): HTMLElement | Text {
    if (isTextElement(element)) {
      return this.htmlDocument.createTextNode(element.text);
    }

    const el = this.htmlDocument.createElement(element.tag);

    for (const [key, value] of Object.entries(element.attrs)) {
      if (key === "onClick") {
        this.registerEffect(
          element,
          el,
          onclick as () => Effect<any, any, any>,
        );
        continue;
      }
      el.setAttribute(key, value);
    }

    for (const child of element.children) {
      el.appendChild(this.renderElement(child));
    }

    return el;
  }

  renderDocument(doc: WeaverDocument): void {
    this.htmlDocument.title = doc.title;
    let descriptionMeta = this.htmlDocument.head.querySelector(
      "meta[name=description]",
    );
    if (!descriptionMeta) {
      descriptionMeta = this.htmlDocument.createElement("meta");
      descriptionMeta.setAttribute("name", "description");
      this.htmlDocument.head.append(descriptionMeta);
    }
    descriptionMeta.setAttribute("content", doc.meta.description ?? "");

    this.htmlDocument.body.append(
      ...doc.body.map((element) => this.renderElement(element)),
    );
  }
}

function isWeaverElement(k: unknown): k is WeaverElement {
  return (k as WeaverElement).tag !== undefined;
}
