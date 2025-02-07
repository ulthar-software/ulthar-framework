// deno-lint-ignore-file no-explicit-any
import { Effect, TaggedError } from "../../core/index.ts";

export type WeaverElement<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> = WeaverHTMLElement<TModel, TError, TDependencies> | WeaverTextElement;

export interface GlobalAttributes<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
> {
  class?: string;
  id?: string;
  draggable?: boolean;
  title?: string;
  role?: string;
  popover?: string;
  hidden?: boolean;

  //Events
  onClick?: () => Effect<TModel, TError, Partial<TDependencies>>;
}

export interface InputAttributes {
  writingSuggestions?: boolean;
}

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
  children: WeaverElement[];
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
