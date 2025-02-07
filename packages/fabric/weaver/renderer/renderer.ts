import { WeaverDocument } from "../document.ts";

export interface Renderer {
  renderView: (document: WeaverDocument) => void;
}
