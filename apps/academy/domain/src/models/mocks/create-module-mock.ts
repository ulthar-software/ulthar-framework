import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import {
  AddModuleToCourseUseCase,
  DeleteModuleUseCase,
} from "../../use-cases/index.js";
import { type Module } from "../module.js";

export async function createModuleMock(
  services: MockedDependencies,
  userId: UUID,
  courseId: UUID,
  module: Partial<Module> = {},
): Promise<UUID> {
  // Create a module in the course
  const moduleResult = await AddModuleToCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      courseId,
      title: module.title ?? "Test Module",
      description: module.description ?? "A module for testing",
    },
  ).runOrThrow();

  if (module.deletedAt) {
    await DeleteModuleUseCase.call(
      {
        ...services,
        currentUser: {
          id: userId,
          permissions: [Permission.EDIT_COURSE],
        },
      },
      {
        moduleId: moduleResult.moduleId,
      },
    ).runOrThrow();
  }

  return moduleResult.moduleId;
}
