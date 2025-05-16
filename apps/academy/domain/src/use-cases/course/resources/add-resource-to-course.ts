import type { Infer, UUID } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import {
  ResourceCreatedEvent,
  ResourceTypeValues,
} from "../../../models/resource.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { CourseNotFoundError } from "../errors.js";

export interface AddResourceToCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
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
});

export type AddResourceToCourseInput = Infer<
  typeof AddResourceToCourseInputModel
>;

export interface AddResourceToCourseOutput {
  resourceId: UUID;
}

export const AddResourceToCourse = new UseCase({
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  name: "addResourceToCourse",
  type: "command",
  inputSchema: AddResourceToCourseInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddResourceToCourseDependencies,
    payload: AddResourceToCourseInput,
  ) => {
    return Effect.fromGen(function* () {
      const { courseId, title, description, url, type } = payload;

      // Check if the course exists
      yield* state
        .from("courses")
        .where({ id: courseId })
        .selectOneOrFail()
        .mapError(() => new CourseNotFoundError(courseId));

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

      return { resourceId };
    });
  },
});
