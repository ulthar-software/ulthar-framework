// deno-lint-ignore-file no-explicit-any
import { TaggedError } from "../../core/index.ts";
import { WeaverElement, WeaverHTMLElement } from "./element.ts";
import { GlobalAttributes } from "./elements/global-attributes.ts";

export function h1<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
>(
  attrs: GlobalAttributes<TModel, TError, TDependencies>,
  children: WeaverElement<TModel, TError, TDependencies>[],
): WeaverHTMLElement<TModel, TError, TDependencies, "h1"> {
  return {
    tag: "h1",
    attrs,
    children,
  };
}
export function h2<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
>(
  attrs: GlobalAttributes,
  children: WeaverElement[],
): WeaverHTMLElement<TModel, TError, TDependencies, "h2"> {
  return {
    tag: "h2",
    attrs,
    children,
  };
}
export function h3<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
>(
  attrs: GlobalAttributes,
  children: WeaverElement[],
): WeaverHTMLElement<TModel, TError, TDependencies, "h3"> {
  return {
    tag: "h3",
    attrs,
    children,
  };
}
export function h4<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
>(
  attrs: GlobalAttributes,
  children: WeaverElement[],
): WeaverHTMLElement<TModel, TError, TDependencies, "h4"> {
  return {
    tag: "h4",
    attrs,
    children,
  };
}
export function h5<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
>(
  attrs: GlobalAttributes,
  children: WeaverElement[],
): WeaverHTMLElement<TModel, TError, TDependencies, "h5"> {
  return {
    tag: "h5",
    attrs,
    children,
  };
}
export function h6<
  TModel = any,
  TError extends TaggedError = never,
  TDependencies = any,
>(
  attrs: GlobalAttributes,
  children: WeaverElement[],
): WeaverHTMLElement<TModel, TError, TDependencies, "h6"> {
  return {
    tag: "h6",
    attrs,
    children,
  };
}
