import type {
  CryptoService,
  Effect,
  UnexpectedError,
  UUID,
} from "@fabric/core";
import { Field, Schema, type Infer } from "@fabric/core";
import { CourseCreatedEvent } from "../../models/course.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";

export interface CreateCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const CreateCourseInputModel = new Schema({
  title: Field.string({
    minLength: 3,
  }),
  description: Field.string({
    isOptional: true,
  }),
});

export type CreateCourseInput = Infer<typeof CreateCourseInputModel>;

export interface CreateCourseOutput {
  courseId: UUID;
}

export const CreateCourseUseCase = new UseCase({
  name: "createCourse",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.CREATE_COURSE),
  inputSchema: CreateCourseInputModel,
  effect: (
    { events, crypto, currentUser }: CreateCourseDependencies,
    { title, description }: CreateCourseInput,
  ): Effect<CreateCourseOutput, UnexpectedError> => {
    const courseId = crypto.randomUUID();
    const eventId = crypto.randomUUID();

    const courseCreatedEvent = CourseCreatedEvent.from({
      id: eventId,
      streamId: courseId,
      payload: {
        title,
        description: description ?? "",
        createdBy: currentUser.id,
      },
      version: 1,
    });

    return events
      .append("courses", courseCreatedEvent)
      .map(() => ({ courseId }));
  },
});
