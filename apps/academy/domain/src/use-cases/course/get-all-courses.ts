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
    const hasViewCoursePermission = currentUser.permissions.includes(
      Permission.VIEW_COURSE,
    );

    if (hasViewCoursePermission) {
      // If user has permission, return all courses
      return state
        .from("courses")
        .select()
        .mapError(() => new UnexpectedError())
        .map((courses) => ({ courses }));
    } else {
      // If user doesn't have permission, only return courses they're enrolled in
      return state
        .from("enrollments")
        .where({ userId: currentUser.id })
        .select()
        .mapError(() => new UnexpectedError())
        .flatMap((enrollments) => {
          // Extract course IDs from enrollments
          const courseIds = enrollments.map(
            (enrollment) => enrollment.courseId,
          );

          // If no enrollments, return empty array
          if (courseIds.length === 0) {
            return Effect.ok<GetAllCoursesOutput>({
              courses: [],
            });
          }

          // Fetch only enrolled courses
          return state
            .from("courses")
            .where({
              id: isIn(courseIds),
            })
            .select()
            .mapError(() => new UnexpectedError())
            .map((courses) => ({ courses }));
        });
    }
  },
});
