export interface WeaverElement {
  tag: string;
  attrs: Record<string, string>;
  children: WeaverElement[];
}
