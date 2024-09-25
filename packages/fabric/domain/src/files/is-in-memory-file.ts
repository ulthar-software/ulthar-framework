import { isRecord } from "@fabric/core";
import validator from "validator";
import { InMemoryFile } from "./in-memory-file.js";

const { isBase64, isMimeType } = validator;

export function isInMemoryFile(value: unknown): value is InMemoryFile {
  try {
    return (
      isRecord(value) &&
      "data" in value &&
      typeof value.data === "string" &&
      isBase64(value.data.split(",")[1]) &&
      "mimeType" in value &&
      typeof value.mimeType === "string" &&
      isMimeType(value.mimeType) &&
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
