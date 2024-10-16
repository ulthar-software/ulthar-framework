import { isRecord } from "@fabric/core";
import type { InMemoryFile } from "./in-memory-file.ts";

export function isInMemoryFile(value: unknown): value is InMemoryFile {
  try {
    return (
      isRecord(value) &&
      "data" in value &&
      typeof value.data === "string" &&
      "mimeType" in value &&
      typeof value.mimeType === "string" &&
      "name" in value &&
      typeof value.name === "string" &&
      "sizeInBytes" in value &&
      typeof value.sizeInBytes === "number" &&
      value.sizeInBytes >= 1
    );
  } catch {
    return false;
  }
}
