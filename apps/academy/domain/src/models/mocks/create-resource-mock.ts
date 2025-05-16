import type { UUID } from "@fabric/core";
import type { MockedDependencies } from "../../mocks.js";
import { Permission } from "../../security/permission.js";
import { AddResourceToCourseUseCase } from "../../use-cases/course/resources/add-resource-to-course.js";

export async function createResourceMock(
  services: MockedDependencies,
  userId: UUID,
  courseId: UUID,
): Promise<UUID> {
  const result = await AddResourceToCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      courseId,
      title: "New Resource",
      description: "This is a new resource",
      url: "http://example.com/resource",
      type: "DOCUMENTATION",
    },
  ).runOrThrow();

  return result.resourceId;
}
