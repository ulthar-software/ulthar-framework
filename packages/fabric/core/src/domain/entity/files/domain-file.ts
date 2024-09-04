import { Entity } from "../entity.js";
import { BaseFile } from "./base-file.js";

/**
 * Represents a file as managed by the domain.
 */
export interface DomainFile extends BaseFile, Entity {
  url: string;
}
