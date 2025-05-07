import {
  Effect,
  Field,
  Schema,
  SchemaParsingError,
  TaggedError,
} from "@fabric/core";
import { describe, expect, test } from "@fabric/testing";
import { AccessPolicy } from "../security/access-policy.js";
import type { Permission } from "../security/permission.js";
import { UnauthorizedError, UseCase } from "./use-case.js";

describe("UseCase", () => {
  test("Given a use case without permissions, when the user is anonymous, then the use case should be accessible", async () => {
    const useCase = new UseCase({
      name: "test",
      type: "query",
      auth: AccessPolicy.Anonymous(),
      effect: () => Effect.ok("OK"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: undefined,
        },
        {},
      )
      .runOrThrow();

    expect(result).toEqual("OK");
  });

  test("Given a use case requiring authentication, when the user is anonymous, then it should return an unauthorized error", async () => {
    const useCase = new UseCase({
      name: "testAuth",
      type: "command",
      auth: AccessPolicy.Authenticated(),
      effect: () => Effect.ok("OK"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: undefined,
        },
        {},
      )
      .run();

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  test("Given a use case requiring authentication, when the user is authenticated, then the use case should be accessible", async () => {
    const useCase = new UseCase({
      name: "testAuth",
      type: "command",
      auth: AccessPolicy.Authenticated(),
      effect: () => Effect.ok("Authorized"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: {
            id: crypto.randomUUID(),
            permissions: [],
          },
        },
        {},
      )
      .runOrThrow();

    expect(result).toEqual("Authorized");
  });

  test("Given a use case requiring specific permissions, when the user lacks those permissions, then it should return an unauthorized error", async () => {
    const requiredPermission = "ADMIN" as Permission;

    const useCase = new UseCase({
      name: "testPerms",
      type: "query",
      auth: AccessPolicy.WithPermission(requiredPermission),
      effect: () => Effect.ok("OK"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: {
            id: crypto.randomUUID(),
            permissions: ["USER" as Permission],
          },
        },
        {},
      )
      .run();

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });

  test("Given a use case requiring specific permissions, when the user has those permissions, then the use case should be accessible", async () => {
    const requiredPermission = "ADMIN" as Permission;

    const useCase = new UseCase({
      name: "testPerms",
      type: "query",
      auth: AccessPolicy.WithPermission(requiredPermission),
      effect: () => Effect.ok("Has Permission"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: {
            id: crypto.randomUUID(),
            permissions: [requiredPermission, "USER" as Permission],
          },
        },
        {},
      )
      .runOrThrow();

    expect(result).toEqual("Has Permission");
  });

  test("Given a use case with an input schema, when valid input is provided, then the use case should process the input", async () => {
    // Simple schema for testing
    const testSchema = new Schema({
      name: Field.string(),
      age: Field.integer(),
    });

    const useCase = new UseCase({
      name: "testSchema",
      type: "command",
      auth: AccessPolicy.Anonymous(),
      effect: (_, input) =>
        Effect.ok(`Hello ${input.name}, you are ${input.age} years old`),
      inputSchema: testSchema,
    });

    const result = await useCase
      .call(
        {
          currentUser: undefined,
        },
        { name: "John", age: 30 },
      )
      .runOrThrow();

    expect(result).toEqual("Hello John, you are 30 years old");
  });

  test("Given a use case with an input schema, when invalid input is provided, then it should return a schema parsing error", async () => {
    const testSchema = new Schema({
      name: Field.string(),
      age: Field.integer(),
    });

    const useCase = new UseCase({
      name: "testSchema",
      type: "command",
      auth: AccessPolicy.Anonymous(),
      effect: (_, input) =>
        Effect.ok(`Hello ${input.name}, you are ${input.age} years old`),
      inputSchema: testSchema,
    });

    const result = await useCase
      .call(
        {
          currentUser: undefined,
        },
        { name: "John", age: "thirty" }, // Invalid age type
      )
      .run();

    expect(result.isError()).toBe(true);
    // The error should be a schema parsing error
    expect(result.value).toBeInstanceOf(SchemaParsingError);
  });

  test("Given a use case that returns an error effect, it should propagate the error", async () => {
    class TestError extends TaggedError<"TestError"> {
      constructor(message: string) {
        super("TestError", message);
        this.name = "TestError";
      }
    }

    const useCase = new UseCase({
      name: "testError",
      type: "query",
      auth: AccessPolicy.Anonymous(),
      effect: () => Effect.failWith(new TestError("Something went wrong")),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: undefined,
        },
        {},
      )
      .run();

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(TestError);
  });

  test("Given a use case requiring multiple permissions, when the user has all required permissions, then the use case should be accessible", async () => {
    const useCase = new UseCase({
      name: "testMultiplePerms",
      type: "command",
      auth: AccessPolicy.WithPermission(
        "ADMIN" as Permission,
        "EDITOR" as Permission,
      ),
      effect: () => Effect.ok("Multiple Permissions"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: {
            id: crypto.randomUUID(),
            permissions: [
              "ADMIN" as Permission,
              "EDITOR" as Permission,
              "USER" as Permission,
            ],
          },
        },
        {},
      )
      .runOrThrow();

    expect(result).toEqual("Multiple Permissions");
  });

  test("Given a use case requiring multiple permissions, when the user is missing one permission, then it should return an unauthorized error", async () => {
    const useCase = new UseCase({
      name: "testMultiplePerms",
      type: "command",
      auth: AccessPolicy.WithPermission(
        "ADMIN" as Permission,
        "EDITOR" as Permission,
      ),
      effect: () => Effect.ok("Multiple Permissions"),
      inputSchema: undefined,
    });

    const result = await useCase
      .call(
        {
          currentUser: {
            id: crypto.randomUUID(),
            permissions: ["ADMIN" as Permission, "USER" as Permission],
          },
        },
        {},
      )
      .run();

    expect(result.isError()).toBe(true);
    expect(result.value).toBeInstanceOf(UnauthorizedError);
  });
});
