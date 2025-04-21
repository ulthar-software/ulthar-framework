import type { Effect, UUID } from "@fabric/core";
import { Field, Model, UnexpectedError, type Infer } from "@fabric/core";
import { ModuleAddedEvent } from "../../../models/module.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import { Permission } from "../../../security/permission.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainCryptoService } from "../../../services/crypto-service.js";
import type { DomainEventStore } from "../../../services/event-store.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { CourseNotFoundError } from "../errors.js";

export interface AddModuleToCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: DomainCryptoService;
  currentUser: UserAccess;
}

export const AddModuleToCourseInputModel = new Model("AddModuleToCourseInput", {
  courseId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
  description: Field.string({
    isOptional: true,
  }),
});

export type AddModuleToCourseInput = Infer<typeof AddModuleToCourseInputModel>;

export interface AddModuleToCourseOutput {
  moduleId: UUID;
}

export const AddModuleToCourseUseCase = new UseCase({
  name: "AddModuleToCourse",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.EDIT_COURSE),
  inputSchema: AddModuleToCourseInputModel,
  effect: (
    { state, events, crypto, currentUser }: AddModuleToCourseDependencies,
    { courseId, title, description }: AddModuleToCourseInput,
  ): Effect<AddModuleToCourseOutput, CourseNotFoundError | UnexpectedError> => {
    return state
      .from("courses")
      .where({ id: courseId })
      .selectOneOrFail()
      .mapError(() => new CourseNotFoundError(courseId))
      .flatMap(() => {
        // Get the count of existing modules for this course to determine the order
        return state
          .from("modules")
          .where({ courseId })
          .count()
          .mapError(() => new UnexpectedError())
          .flatMap((count) => {
            const moduleId = crypto.randomUUID();
            const eventId = crypto.randomUUID();
            const moduleOrder = count * 100 + 100; // Set order to 100 more than last module (maintains spacing of 100)

            const moduleAddedEvent = ModuleAddedEvent.from({
              id: eventId,
              streamId: moduleId,
              payload: {
                title,
                description: description ?? "",
                courseId,
                order: moduleOrder,
                createdBy: currentUser.id,
              },
              version: 1n,
            });

            return events
              .append("modules", moduleAddedEvent)
              .map(() => ({ moduleId }));
          });
      });
  },
});
