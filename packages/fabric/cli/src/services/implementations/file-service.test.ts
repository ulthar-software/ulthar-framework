import {
  Field,
  JSONParsingError,
  Model,
  SchemaParsingError,
} from "@fabric/core";
import { describe, expect, it } from "@fabric/testing";
import path from "path";
import { FileReadError } from "../file-service.js";
import { FileServiceImplementation } from "./file-service.js";

describe("FileService", () => {
  const fileService = new FileServiceImplementation();
  it("should read a json file", async () => {
    const model = new Model("test", {
      name: Field.string(),
      value: Field.boolean(),
    });

    const result = await fileService
      .readJsonFile(
        model,
        path.join(import.meta.dirname, "__tests__", "obj-test.json"),
      )
      .runOrThrow();

    expect(result).toEqual({
      name: "test",
      value: true,
    });
  });

  it("should fail to read a non existent json file", async () => {
    const model = new Model("test", {
      name: Field.string(),
      value: Field.boolean(),
    });

    const result = await fileService
      .readJsonFile(
        model,
        path.join(import.meta.dirname, "__tests__", "non-existent.json"),
      )
      .run();

    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(FileReadError);
  });

  it("should fail to read a json file with invalid content", async () => {
    const model = new Model("test", {
      name: Field.string(),
      value: Field.boolean(),
    });

    const result = await fileService
      .readJsonFile(
        model,
        path.join(import.meta.dirname, "__tests__", "invalid.json"),
      )
      .run();

    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(JSONParsingError);
  });

  it("should fail to read a json file with invalid content", async () => {
    const model = new Model("test", {
      some: Field.string(),
      other: Field.boolean(),
    });

    const result = await fileService
      .readJsonFile(
        model,
        path.join(import.meta.dirname, "__tests__", "obj-test.json"),
      )
      .run();

    expect(result.unwrapErrorOrThrow()).toBeInstanceOf(SchemaParsingError);
  });
});
