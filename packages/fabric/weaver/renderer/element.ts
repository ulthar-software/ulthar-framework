// deno-lint-ignore-file no-explicit-any
import { TaggedError } from "../../core/index.ts";
import { GlobalAttributes } from "./elements/global-attributes.ts";

export type WeaverElement<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> = WeaverHTMLElement<TModel, TError, TDependencies> | WeaverTextElement;

export type ElementTag = HeadingTag | CustomElementTags;
export type HeadingTag = "h1" | "h2" | "h3" | "h4" | "h5" | "h6";
export type CustomElementTags = "icon";

export interface WeaverHTMLElement<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
  T extends ElementTag = ElementTag,
> {
  tag: T;
  attrs: GlobalAttributes<TModel, TError, TDependencies>;
  children: WeaverElement<TModel, TError, TDependencies>[];
}

export interface WeaverTextElement {
  tag: "text";
  text: string;
}

export function isTextElement(
  element: WeaverElement,
): element is WeaverTextElement {
  return element.tag === "text";
}

export function text(text: string): WeaverTextElement {
  return {
    tag: "text",
    text,
  };
}
