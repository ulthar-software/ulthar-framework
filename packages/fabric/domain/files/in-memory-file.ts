import type { Base64String } from "../types/base-64.ts";
import type { BaseFile } from "./base-file.ts";

/**
 * Represents a file with its contents in memory.
 */
export interface InMemoryFile extends BaseFile {
  data: Base64String;
}
