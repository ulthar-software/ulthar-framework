import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { EnrollStudentInCourseUseCase } from "../../use-cases/index.js";

export async function createEnrollmentMock(
  services: MockedDependencies,
  userId: UUID,
  courseId: UUID,
): Promise<UUID> {
  // Create an enrollment using the use case
  const enrollmentResult = await EnrollStudentInCourseUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.ENROLL_STUDENTS],
      },
    },
    {
      courseId,
      studentId: userId,
    },
  ).runOrThrow();

  return enrollmentResult.enrollmentId;
}
