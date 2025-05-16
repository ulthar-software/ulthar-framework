import type { UUID } from "@fabric/core";
import {
  Effect,
  Field,
  isIn,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import { ResourceTagModel } from "../../../../models/resource-tag.js";
import type { ResourceType } from "../../../../models/resource.js";
import { AccessPolicy } from "../../../../security/access-policy.js";
import type { UserAccess } from "../../../../services/auth-service.js";
import type { DomainStateStore } from "../../../../services/state-store.js";
import { UseCase } from "../../../../utils/use-case.js";
import type {
  CourseNotFoundError,
  NotEnrolledInCourseError,
} from "../../errors.js";
import { UnitNotFoundError } from "../../errors.js";
import { assertValidatedInCourse } from "../../utils/assert-validated-in-course.js";

export interface GetResourcesByUnitTagsDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export const GetResourcesByUnitTagsInputModel = new Schema({
  courseId: Field.uuid(),
  unitId: Field.uuid(),
  getFullCourse: Field.boolean({
    isOptional: true,
  }),
});

export type GetResourcesByUnitTagsInput = Infer<
  typeof GetResourcesByUnitTagsInputModel
>;

export interface ResourceDetails {
  id: UUID;
  title: string;
  type: ResourceType;
  url: string;
  description: string;
}

export interface GetResourcesByUnitTagsOutput {
  resources: ResourceDetails[];
}

export const GetResourcesByUnitTagsUseCase = new UseCase({
  name: "getResourcesByUnitTags",
  type: "query",
  auth: AccessPolicy.Authenticated(),
  inputSchema: GetResourcesByUnitTagsInputModel,
  effect: (
    { state, currentUser }: GetResourcesByUnitTagsDependencies,
    { courseId, unitId, getFullCourse }: GetResourcesByUnitTagsInput,
  ): Effect<
    GetResourcesByUnitTagsOutput,
    | CourseNotFoundError
    | NotEnrolledInCourseError
    | UnitNotFoundError
    | UnexpectedError
  > => {
    // First check if the course exists
    return state
      .from("units")
      .where({ id: unitId })
      .selectOneOrFail()
      .mapError(() => new UnitNotFoundError(unitId))
      .flatMap(() => assertValidatedInCourse(state, currentUser, courseId))
      .flatMap(() =>
        getResourcesByUnitTags(state, unitId, courseId, getFullCourse),
      );
  },
});

function getResourcesByUnitTags(
  state: DomainStateStore,
  unitId: UUID,
  courseId: UUID,
  shouldGetFullCourse = false,
): Effect<GetResourcesByUnitTagsOutput, UnexpectedError> {
  // First get all tags associated with this unit
  return Effect.fromGen(function* () {
    if (shouldGetFullCourse) {
      const result = yield* state
        .from("resources")
        .where({
          courseId,
        })
        .select(["id", "title", "type", "url", "description"])
        .tapError((e) => {
          console.error(e);
        })
        .mapError(() => new UnexpectedError());
      return {
        resources: result,
      };
    }
    const unitTags = yield* state
      .from("unitTags")
      .where({ unitId: unitId })
      .select();

    if (unitTags.length === 0) {
      return {
        resources: [],
      };
    }

    // Extract tag IDs from unit tags
    const tagIds = unitTags.map((tag) => tag.tagId);

    const resources = yield* state
      .from("resources")
      .innerJoin({
        model: ResourceTagModel,
        as: "t",
        on: {
          left: "id",
          right: "resourceId",
        },
      })
      .where({
        "t.tagId": isIn(tagIds),
      })
      .selectDistinct(["id", "title", "type", "url", "description"])
      .tapError((e) => {
        console.error(e);
      })
      .mapError(() => new UnexpectedError());

    return {
      resources,
    };
  });
}
