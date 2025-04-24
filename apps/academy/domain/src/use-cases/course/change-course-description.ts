import type { Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { CourseDescriptionChangedEvent } from "../../models/course.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainCryptoService } from "../../services/crypto-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import { CourseNotFoundError } from "./errors.js";

export interface ChangeCourseDescriptionDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const ChangeCourseDescriptionInputModel = new Schema({
  courseId: Field.uuid(),
  description: Field.string(),
});

export type ChangeCourseDescriptionInput = Infer<
  typeof ChangeCourseDescriptionInputModel
>;

export const ChangeCourseDescriptionUseCase = new UseCase({
  name: "changeCourseDescription",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: ChangeCourseDescriptionInputModel,
  effect: (
    { state, events, crypto, currentUser }: ChangeCourseDescriptionDependencies,
    { courseId, description }: ChangeCourseDescriptionInput,
  ): Effect<void, CourseNotFoundError | UnexpectedError> => {
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap((course) => {
        const eventId = crypto.randomUUID();

        const courseDescriptionChangedEvent =
          CourseDescriptionChangedEvent.from({
            id: eventId,
            streamId: courseId,
            payload: {
              description,
              updatedBy: currentUser.id,
            },
            version: course.version + 1, // Increment the version
          });

        return events
          .append("courses", courseDescriptionChangedEvent)
          .discardValue();
      });
  },
});
