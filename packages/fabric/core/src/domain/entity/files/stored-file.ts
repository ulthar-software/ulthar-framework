import { BaseFile } from "../../../files/base-file.js";
import { Entity } from "../entity.js";

/**
 * Represents a file as managed by the domain.
 */
export interface StoredFile extends BaseFile, Entity {
  url: string;
}
