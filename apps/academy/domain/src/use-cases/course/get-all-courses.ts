import { Effect, isIn, UnexpectedError } from "@fabric/core";
import type { Course } from "../../models/course.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface GetAllCoursesDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export interface GetAllCoursesOutput {
  courses: Course[];
}

export const GetAllCoursesUseCase = new UseCase({
  name: "getAllCourses",
  type: "query",
  auth: AccessPolicy.Authenticated(),
  effect: ({
    state,
    currentUser,
  }: GetAllCoursesDependencies): Effect<
    GetAllCoursesOutput,
    UnexpectedError
  > => {
    // Check if user has permission to view all courses
    return Effect.fromGen(function* () {
      const hasViewCoursePermission = currentUser.permissions.includes(
        Permission.VIEW_COURSE,
      );
      if (hasViewCoursePermission) {
        const courses = yield* state
          .from("courses")
          .select()
          .mapError(() => new UnexpectedError());

        return { courses };
      } else {
        const enrollments = yield* state
          .from("enrollments")
          .where({ userId: currentUser.id })
          .select()
          .mapError(() => new UnexpectedError());

        // Extract course IDs from enrollments
        const courseIds = enrollments.map((enrollment) => enrollment.courseId);

        // If no enrollments, return empty array
        if (courseIds.length === 0) {
          return { courses: [] };
        }

        // Fetch only enrolled courses
        const courses = yield* state
          .from("courses")
          .where({
            id: isIn(courseIds),
          })
          .select()
          .mapError(() => new UnexpectedError());

        return { courses };
      }
    });
  },
});
