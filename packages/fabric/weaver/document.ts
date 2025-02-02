import { WeaverElement } from "./element.ts";

export interface WeaverDocument {
  title: string;
  description: string;
  keywords: string[];
  body: WeaverElement[];
}
