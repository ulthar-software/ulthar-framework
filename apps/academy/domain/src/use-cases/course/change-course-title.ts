import type { Effect, UnexpectedError } from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { CourseTitleChangedEvent } from "../../models/course.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainCryptoService } from "../../services/crypto-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import { CourseNotFoundError } from "./errors.js";

export interface ChangeCourseTitleDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const ChangeCourseTitleInputModel = new Schema({
  courseId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
});

export type ChangeCourseTitleInput = Infer<typeof ChangeCourseTitleInputModel>;

export const ChangeCourseTitleUseCase = new UseCase({
  name: "changeCourseTitle",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: ChangeCourseTitleInputModel,
  effect: (
    { state, events, crypto, currentUser }: ChangeCourseTitleDependencies,
    { courseId, title }: ChangeCourseTitleInput,
  ): Effect<void, CourseNotFoundError | UnexpectedError> => {
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap((course) => {
        const eventId = crypto.randomUUID();

        const courseTitleChangedEvent = CourseTitleChangedEvent.from({
          id: eventId,
          streamId: courseId,
          payload: {
            title,
            updatedBy: currentUser.id,
          },
          version: course.version + 1n, // Increment the version
        });

        return events.append("courses", courseTitleChangedEvent).discardValue();
      });
  },
});
