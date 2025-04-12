/* eslint-disable @typescript-eslint/no-unsafe-assignment */
import { PosixDate } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import type { User } from "../../models/user.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../services/mocks/create-mock-services.js";
import { createUserMock } from "../../services/mocks/create-user-mock.js";
import createProject from "./create.js";

describe("Create Project", () => {
  let services: MockedDependencies;
  let currentUser: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    currentUser = await createUserMock(services);
  });

  test("Given a project name and description, it should create a new project", async () => {
    // Arrange

    const name = "My Project";
    const description = "This is my project";

    // Act
    const result = await createProject
      .useCase(
        { ...services, currentUserId: currentUser.id },
        { name, description },
      )
      .run();

    // Assert
    expect(result.unwrapOrThrow()).toEqual({
      type: "ProjectCreated",
      id: expect.any(String),
      streamId: expect.any(String),
      payload: {
        name,
        description,
        userId: currentUser.id,
      },
      timestamp: expect.any(PosixDate),
      version: 1n,
    });

    const project = await services.state
      .from("projects")
      .selectOneOrFail()
      .runOrThrow();

    expect(project).toEqual({
      id: expect.any(String),
      name,
      description,
      userId: currentUser.id,
      createdAt: expect.any(PosixDate),
      updatedAt: expect.any(PosixDate),
      repositoryId: null,
      repositoryProvider: null,
      version: 1n,
    });
  });

  test("Given a project name that already exists, it should return a ProjectNameInUseError", async () => {
    // const currentUserId = crypto.randomUUID();
    // const name = "My Project";
    // const description = "This is my project";
    // // Act
    // await createProject
    //   .useCase({ ...services, currentUserId }, { name, description })
    //   .run();
    // const result = await createProject
    //   .useCase({ ...services, currentUserId }, { name, description })
    //   .run();
    // // Assert
    // expect(result.unwrapErrorOrThrow()).toBeInstanceOf(ProjectNameInUseError);
  });
});
