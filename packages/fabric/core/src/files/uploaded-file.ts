import { Base64String } from "../domain/types/base-64.js";
import { BaseFile } from "./base-file.js";

/**
 * Represents a file with its contents in memory.
 */
export interface InMemoryFile extends BaseFile {
  data: Base64String;
}
