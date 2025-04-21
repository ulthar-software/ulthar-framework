import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import {
  AddModuleToCourseUseCase,
  CreateCourseUseCase,
} from "../../use-cases/index.js";

export async function createCourseMock(
  services: MockedDependencies,
  userId: UUID,
): Promise<[UUID, UUID[]]> {
  const courseResult = await CreateCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.CREATE_COURSE],
      },
    },
    {
      title: "Test Course",
      description: "A course for testing module listing",
    },
  ).runOrThrow();

  const moduleIds: UUID[] = [];

  // Add multiple modules to the course
  const module1Result = await AddModuleToCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      courseId: courseResult.courseId,
      title: "Module 1",
      description: "First module",
    },
  ).runOrThrow();
  moduleIds.push(module1Result.moduleId);

  const module2Result = await AddModuleToCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      courseId: courseResult.courseId,
      title: "Module 2",
      description: "Second module",
    },
  ).runOrThrow();
  moduleIds.push(module2Result.moduleId);

  const module3Result = await AddModuleToCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      courseId: courseResult.courseId,
      title: "Module 3",
      description: "Third module",
    },
  ).runOrThrow();
  moduleIds.push(module3Result.moduleId);

  return [courseResult.courseId, moduleIds];
}
