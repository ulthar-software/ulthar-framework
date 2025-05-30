import type { CryptoService, Infer, UnexpectedError, UUID } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { ResourceTagCreatedEvent } from "../../../models/resource-tag.js";
import {
  ResourceCreatedEvent,
  ResourceTypeValues,
} from "../../../models/resource.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { TagNotFoundError } from "../../tag/errors.js";
import { CourseNotFoundError } from "../errors.js";

export interface AddResourceToCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const AddResourceToCourseInputModel = new Schema({
  courseId: Field.uuid(),
  title: Field.string(),
  description: Field.string(),
  url: Field.string(),
  type: Field.enum({
    values: ResourceTypeValues,
  }),
  tagIds: Field.array(Field.uuid(), {
    isOptional: true,
  }),
});

export type AddResourceToCourseInput = Infer<
  typeof AddResourceToCourseInputModel
>;

export interface AddResourceToCourseOutput {
  resourceId: UUID;
}

export const AddResourceToCourseUseCase = new UseCase({
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  name: "addResourceToCourse",
  type: "command",
  inputSchema: AddResourceToCourseInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddResourceToCourseDependencies,
    payload: AddResourceToCourseInput,
  ): Effect<
    AddResourceToCourseOutput,
    CourseNotFoundError | TagNotFoundError | UnexpectedError
  > => {
    return Effect.fromGen(function* () {
      const { courseId, title, description, url, type, tagIds } = payload;

      // Check if the course exists
      yield* state
        .from("courses")
        .where({ id: courseId })
        .selectOneOrFail()
        .mapError(() => new CourseNotFoundError(courseId));

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (tagIds) {
        for (const tagId of tagIds) {
          // Check if the tag exists
          yield* state
            .from("tags")
            .where({ id: tagId })
            .selectOneOrFail()
            .mapError(() => new TagNotFoundError(tagId));
        }
      }

      // Create the resource
      const resourceId = crypto.randomUUID();

      const createResourceEvent = ResourceCreatedEvent.from({
        id: crypto.randomUUID(),
        streamId: resourceId,
        payload: {
          courseId,
          title,
          description,
          url,
          type,
          createdBy: currentUser.id,
        },
        version: 1,
      });

      // Store the resource in the event store
      yield* events.append("resources", createResourceEvent);

      // eslint-disable-next-line @typescript-eslint/no-unnecessary-condition
      if (tagIds) {
        // Add the tags to the resource
        for (const tagId of tagIds) {
          const addTagEvent = ResourceTagCreatedEvent.from({
            id: crypto.randomUUID(),
            streamId: crypto.randomUUID(),
            payload: {
              tagId,
              resourceId,
              createdBy: currentUser.id,
            },
            version: 1,
          });

          // Store the tag in the event store
          yield* events.append("resourceTags", addTagEvent);
        }
      }

      return { resourceId };
    });
  },
});
