import type { UUID } from "@fabric/core";
import {
  Effect,
  Field,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import type { TaggedContentSection } from "../../../../models/sections/index.js";
import { SectionType } from "../../../../models/sections/index.js";
import type { Unit } from "../../../../models/unit.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import type { NotEnrolledInCourseError } from "../../errors.js";
import { CourseNotFoundError, UnitNotFoundError } from "../../errors.js";
import { assertValidatedInCourse } from "../../utils/assert-validated-in-course.js";

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
  sections: TaggedContentSection[];
}

export const GetUnitWithSectionsUseCase = new UseCase({
  name: "getUnitWithSections",
  type: "query",
  auth: AccessPolicy.Authenticated(),
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
      .map((p) =>
        p.map(
          (q) =>
            ({
              ...q,
              type: SectionType.TEXT,
            }) as TaggedContentSection,
        ),
      )
      .mapError(() => new UnexpectedError()),

    // Fetch video sections
    state
      .from("videoSections")
      .where({ unitId: unit.id })
      .select()
      .map((p) =>
        p.map(
          (q) =>
            ({
              ...q,
              type: SectionType.VIDEO,
            }) as TaggedContentSection,
        ),
      )
      .mapError(() => new UnexpectedError()),

    // Fetch questionnaire sections
    state
      .from("questionnaireSections")
      .where({ unitId: unit.id })
      .select()
      .map((p) =>
        p.map(
          (q) =>
            ({
              ...q,
              type: SectionType.QUESTIONNAIRE,
            }) as TaggedContentSection,
        ),
      )
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
