import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { CreateCourseUseCase } from "../../use-cases/index.js";
import type { Course } from "../course.js";

export async function createCourseMock(
  services: MockedDependencies,
  userId: UUID,
  course: Partial<Course> = {},
): Promise<UUID> {
  const courseResult = await CreateCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.CREATE_COURSE],
      },
    },
    {
      title: course.title ?? "Test Course",
      description: course.description ?? "A course for testing",
    },
  ).runOrThrow();

  return courseResult.courseId;
}
