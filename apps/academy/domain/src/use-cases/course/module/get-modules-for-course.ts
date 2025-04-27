import {
  Effect,
  Field,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import type { Module } from "../../../models/module.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { CourseNotFoundError, NotEnrolledInCourseError } from "../errors.js";

export interface GetModulesForCourseDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export const GetModulesForCourseInputModel = new Schema({
  courseId: Field.uuid(),
});

export type GetModulesForCourseInput = Infer<
  typeof GetModulesForCourseInputModel
>;

export interface GetModulesForCourseOutput {
  modules: Module[];
}

export const GetModulesForCourseUseCase = new UseCase({
  name: "getModulesForCourse",
  type: "query",
  auth: AccessPolicy.Authenticated(),
  inputSchema: GetModulesForCourseInputModel,
  effect: (
    { state, currentUser }: GetModulesForCourseDependencies,
    { courseId }: GetModulesForCourseInput,
  ): Effect<
    GetModulesForCourseOutput,
    CourseNotFoundError | NotEnrolledInCourseError | UnexpectedError
  > => {
    // First check if the course exists
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap((): Effect<void, NotEnrolledInCourseError> => {
        if (!currentUser.permissions.includes(Permission.VIEW_COURSE)) {
          return state
            .from("enrollments")
            .where({
              userId: currentUser.id,
              courseId,
            })
            .selectOneOrFail()
            .discardValue()
            .mapError(
              () => new NotEnrolledInCourseError(currentUser.id, courseId),
            );
        }
        return Effect.ok();
      })
      .flatMap(() =>
        state
          .from("modules")
          .where({ courseId })
          .orderBy({
            order: "ASC",
          })
          .select()
          .mapError(() => new UnexpectedError())
          .map((modules) => ({
            modules,
          })),
      );
  },
});
