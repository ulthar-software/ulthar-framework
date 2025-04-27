import type { UUID } from "@fabric/core";
import { Effect } from "@fabric/core";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { NotEnrolledInCourseError } from "../errors.js";

export function assertValidatedInCourse(
  state: DomainStateStore,
  currentUser: UserAccess,
  courseId: UUID,
): Effect<void, NotEnrolledInCourseError> {
  // If user doesn't have VIEW_COURSE permission, check if they're enrolled
  if (!currentUser.permissions.includes(Permission.VIEW_COURSE)) {
    return state
      .from("enrollments")
      .where({
        userId: currentUser.id,
        courseId,
      })
      .selectOneOrFail()
      .discardValue()
      .mapError(() => new NotEnrolledInCourseError(currentUser.id, courseId));
  }
  return Effect.ok();
}
