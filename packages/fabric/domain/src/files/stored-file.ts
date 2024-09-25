import { Entity } from "../types/entity.js";
import { BaseFile } from "./base-file.js";

/**
 * Represents a file as managed by the domain.
 */
export interface StoredFile extends BaseFile, Entity {
  url: string;
}
