import { WeaverElement } from "./element.ts";

export interface WeaverDocument {
  title: string;
  tags: string[];
  body: WeaverElement[];
}
