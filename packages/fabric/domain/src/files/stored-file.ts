import type { Entity } from "../types/entity.ts";
import type { BaseFile } from "./base-file.ts";

/**
 * Represents a file as managed by the domain.
 */
export interface StoredFile extends BaseFile, Entity {
  url: string;
}
