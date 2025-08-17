/* eslint-disable @typescript-eslint/no-unnecessary-condition */
import type { Infer, UUID } from "@fabric/core";
import { Effect, Field, Schema, UnexpectedError, isIn } from "@fabric/core";
import type { Course } from "../../models/course.js";
import type { Module } from "../../models/module.js";
import type { Unit } from "../../models/unit.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import { CourseNotFoundError, NotEnrolledInCourseError } from "./errors.js";

export interface GetCourseDetailsDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export const GetCourseDetailsInputModel = new Schema({
  courseId: Field.uuid(),
});

export type GetCourseDetailsInput = Infer<typeof GetCourseDetailsInputModel>;

export interface UnitSummary {
  id: UUID;
  title: string;
  order: number;
}

export interface ModuleSummary {
  id: UUID;
  title: string;
  units: UnitSummary[];
  order: number;
}

export interface GetCourseDetailsOutput {
  course: Course;
  modules: ModuleSummary[];
}

export const GetCourseDetailsUseCase = new UseCase({
  name: "getCourseDetails",
  type: "query",
  auth: AccessPolicy.Authenticated(),
  inputSchema: GetCourseDetailsInputModel,
  effect: (
    { state, currentUser }: GetCourseDetailsDependencies,
    { courseId }: GetCourseDetailsInput,
  ): Effect<
    GetCourseDetailsOutput,
    CourseNotFoundError | NotEnrolledInCourseError | UnexpectedError
  > => {
    // First check if the course exists
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap((course: Course): Effect<Course, NotEnrolledInCourseError> => {
        // If user doesn't have VIEW_COURSE permission, check if they're enrolled
        if (!currentUser.permissions.includes(Permission.VIEW_COURSE)) {
          return state
            .from("enrollments")
            .where({
              userId: currentUser.id,
              courseId,
            })
            .selectOneOrFail()
            .mapError(
              () => new NotEnrolledInCourseError(currentUser.id, courseId),
            )
            .map(() => course);
        }
        return Effect.ok(course);
      })
      .flatMap((course: Course) => {
        // Get all modules for this course
        return state
          .from("modules")
          .where({ courseId, deletedAt: undefined })
          .orderBy({ order: "ASC" })
          .select()
          .mapError(() => new UnexpectedError())
          .flatMap((modules: Module[]) => {
            if (modules.length === 0) {
              // If there are no modules, return the course with empty modules array
              return Effect.ok<GetCourseDetailsOutput>({
                course,
                modules: [],
              });
            }

            // Get module IDs to fetch their units
            const moduleIds = modules.map((module) => module.id);

            // Get units for all modules
            return state
              .from("units")
              .where({
                moduleId: isIn(moduleIds),
                deletedAt: undefined, // Only fetch non-deleted units
              })
              .orderBy({ order: "ASC" })
              .select()
              .mapError(() => new UnexpectedError())
              .map((units: Unit[]) => {
                // Group units by moduleId for easier processing
                const unitsByModule: Record<string, UnitSummary[]> = {};

                // Initialize with empty arrays for all modules
                moduleIds.forEach((moduleId) => {
                  unitsByModule[moduleId] = [];
                });

                // Group units by their module ID
                units.forEach((unit) => {
                  unitsByModule[unit.moduleId].push({
                    id: unit.id,
                    title: unit.title,
                    order: unit.order,
                  });
                });

                // Create the module summary with their units
                const moduleSummaries: ModuleSummary[] = modules.map(
                  (module) => ({
                    id: module.id,
                    title: module.title,
                    units: unitsByModule[module.id] || [],
                    order: module.order,
                  }),
                );

                return {
                  course,
                  modules: moduleSummaries,
                };
              });
          });
      });
  },
});
