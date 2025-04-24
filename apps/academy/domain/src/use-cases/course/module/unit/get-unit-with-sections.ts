import type { UUID } from "@fabric/core";
import {
  Effect,
  Field,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import type { ContentSection } from "../../../../models/sections/index.js";
import type { Unit } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import { Permission } from "../../../../security/permission.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import {
  CourseNotFoundError,
  NotEnrolledInCourseError,
  UnitNotFoundError,
} from "../../errors.js";

export interface GetUnitWithSectionsDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

// Input model allowing unitId to be optional
export const GetUnitWithSectionsInputModel = new Schema({
  courseId: Field.uuid(),
  unitId: Field.uuid({ isOptional: true }),
});

export type GetUnitWithSectionsInput = Infer<
  typeof GetUnitWithSectionsInputModel
>;

export interface GetUnitWithSectionsOutput {
  unit: Unit;
  sections: ContentSection[];
}

export const GetUnitWithSectionsUseCase = new UseCase({
  name: "getUnitWithSections",
  type: "query",
  auth: AccessPolicy.LoggedIn(),
  inputSchema: GetUnitWithSectionsInputModel,
  effect: (
    { state, currentUser }: GetUnitWithSectionsDependencies,
    { courseId, unitId }: GetUnitWithSectionsInput,
  ): Effect<
    GetUnitWithSectionsOutput,
    | CourseNotFoundError
    | NotEnrolledInCourseError
    | UnitNotFoundError
    | UnexpectedError
  > => {
    // First check if the course exists
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap(() => assertValidatedInCourse(state, currentUser, courseId))
      .flatMap(() => getUnitFromMaybeId(state, courseId, unitId))
      .flatMap((unit) => getUnitWithSections(state, unit));
  },
});

function assertValidatedInCourse(
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

function getUnitFromMaybeId(
  state: DomainStateStore,
  courseId: UUID,
  unitId?: UUID,
): Effect<Unit, UnexpectedError | UnitNotFoundError> {
  // If unitId is provided, use it; otherwise find the first unit in the first module
  if (unitId) {
    return state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(unitId));
  }

  // Find the first module of the course
  return state
    .from("modules")
    .where({ courseId })
    .orderBy({ order: "ASC" })
    .limit(1)
    .selectOneOrFail()
    .mapError(() => new UnexpectedError())
    .flatMap((firstModule) => {
      // Find the first unit in that module
      return state
        .from("units")
        .where({ moduleId: firstModule.id })
        .orderBy({ order: "ASC" })
        .limit(1)
        .selectOneOrFail()
        .mapError(() => new UnexpectedError());
    });
}

function getUnitWithSections(
  state: DomainStateStore,
  unit: Unit,
): Effect<GetUnitWithSectionsOutput, UnexpectedError> {
  // Now that we have the unit, fetch all sections for this unit
  // We need to query each section table separately since they are stored in different tables
  return Effect.all(() => [
    // Fetch text sections
    state
      .from("textSections")
      .where({ unitId: unit.id })
      .select()
      .mapError(() => new UnexpectedError()),

    // Fetch video sections
    state
      .from("videoSections")
      .where({ unitId: unit.id })
      .select()
      .mapError(() => new UnexpectedError()),

    // Fetch questionnaire sections
    state
      .from("questionnaireSections")
      .where({ unitId: unit.id })
      .select()
      .mapError(() => new UnexpectedError()),
  ]).map(([textSections, videoSections, questionnaireSections]) => {
    // Combine all sections into a single array
    const allSections = [
      ...textSections,
      ...videoSections,
      ...questionnaireSections,
    ];

    // Sort sections by their order field
    const sortedSections = allSections.sort((a, b) => a.order - b.order);

    return {
      unit,
      sections: sortedSections,
    };
  });
}
