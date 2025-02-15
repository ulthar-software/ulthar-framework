/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PosixDate } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import {
  createMockServices,
  type Dependencies,
} from "../../services/mocks/create-mock-services.js";
import createProject from "./create.js";

describe("Create Project", () => {
  let services: Dependencies;

  beforeEach(async () => {
    services = await createMockServices();
  });

  test("Given a project name and description, it should create a new project", async () => {
    // Arrange
    const currentUserId = crypto.randomUUID();
    const name = "My Project";
    const description = "This is my project";

    // Act
    const result = await createProject
      .useCase({ ...services, currentUserId }, { name, description })
      .run();

    // Assert
    expect(result.unwrapOrThrow()).toEqual({
      _tag: "ProjectCreated",
      id: expect.any(String),
      streamId: expect.any(String),
      payload: {
        name,
        description,
        userId: currentUserId,
      },
      timestamp: expect.any(PosixDate),
      version: 1n,
    });
  });
});
