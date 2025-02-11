import type { WeaverDocument } from "../document.js";

export interface Renderer {
  renderView: (document: WeaverDocument) => void;
}
