import type { Effect, UnexpectedError } from "@fabric/core";
import { Field, Model, TaggedError, type Infer } from "@fabric/core";
import { CourseUpdatedEvent } from "../../models/course.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainCryptoService } from "../../services/crypto-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface EditCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const EditCourseInputModel = new Model("EditCourseInput", {
  courseId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
  description: Field.string({
    isOptional: true,
  }),
});

export type EditCourseInput = Infer<typeof EditCourseInputModel>;

export class CourseNotFoundError extends TaggedError<"CourseNotFoundError"> {
  constructor(courseId: string) {
    super("CourseNotFoundError", `Course with ID ${courseId} not found`);
  }
}

export const EditCourseUseCase = new UseCase({
  name: "EditCourse",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: EditCourseInputModel,
  effect: (
    { state, events, crypto, currentUser }: EditCourseDependencies,
    { courseId, title, description }: EditCourseInput,
  ): Effect<void, CourseNotFoundError | UnexpectedError> => {
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap((course) => {
        const eventId = crypto.randomUUID();

        const courseUpdatedEvent = CourseUpdatedEvent.from({
          id: eventId,
          streamId: courseId,
          payload: {
            title,
            description: description ?? course.description,
            updatedBy: currentUser.id,
          },
          version: course.version + 1n, // Increment the version
        });

        return events.append("courses", courseUpdatedEvent).discardValue();
      });
  },
});
