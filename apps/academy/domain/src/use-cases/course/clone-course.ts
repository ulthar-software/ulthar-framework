import type { CryptoService, Infer, UUID } from "@fabric/core";
import { Effect, Field, Schema, UnexpectedError } from "@fabric/core";
import { CourseCreatedEvent } from "../../models/course.js";
import { ModuleAddedEvent } from "../../models/module.js";
import { ResourceCreatedEvent } from "../../models/resource.js";
import {
  QuestionnaireSectionAddedEvent,
  TextSectionAddedEvent,
  VideoSectionAddedEvent,
} from "../../models/sections/index.js";
import { UnitAddedEvent } from "../../models/unit.js";
import { AccessPolicy } from "../../security/access-policy.js";
import { Permission } from "../../security/permission.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import { CourseNotFoundError } from "./errors.js";

export interface CloneCourseDependencies {
  state: DomainStateStore;
  events: DomainEventStore;
  crypto: CryptoService;
  currentUser: UserAccess;
}

export const CloneCourseInputModel = new Schema({
  sourceId: Field.uuid(),
  title: Field.string({
    minLength: 3,
  }),
  description: Field.string({
    isOptional: true,
  }),
});

export type CloneCourseInput = Infer<typeof CloneCourseInputModel>;

export interface CloneCourseOutput {
  courseId: UUID;
}

export const CloneCourseUseCase = new UseCase({
  name: "cloneCourse",
  type: "command",
  auth: AccessPolicy.WithPermission(Permission.CREATE_COURSE),
  inputSchema: CloneCourseInputModel,
  effect: (
    { state, events, crypto, currentUser }: CloneCourseDependencies,
    { sourceId, title, description }: CloneCourseInput,
  ): Effect<CloneCourseOutput, CourseNotFoundError | UnexpectedError> => {
    return Effect.fromGen(function* () {
      // First check if the source course exists
      const sourceCourse = yield* state
        .from("courses")
        .where({ id: sourceId })
        .selectOneOrFail()
        .mapError(() => new CourseNotFoundError(sourceId));

      // Create the new course
      const newCourseId = crypto.randomUUID();
      const courseCreatedEvent = CourseCreatedEvent.from({
        id: crypto.randomUUID(),
        streamId: newCourseId,
        payload: {
          title,
          description: description ?? sourceCourse.description,
          createdBy: currentUser.id,
        },
        version: 1,
      });

      yield* events.append("courses", courseCreatedEvent);

      // Get all non-deleted modules from the source course
      const sourceModules = yield* state
        .from("modules")
        .where({ courseId: sourceId, deletedAt: undefined })
        .orderBy({ order: "ASC" })
        .select()
        .mapError(() => new UnexpectedError());

      // Clone each module
      for (const sourceModule of sourceModules) {
        const newModuleId = crypto.randomUUID();
        const moduleAddedEvent = ModuleAddedEvent.from({
          id: crypto.randomUUID(),
          streamId: newModuleId,
          payload: {
            title: sourceModule.title,
            description: sourceModule.description,
            courseId: newCourseId,
            order: sourceModule.order,
            createdBy: currentUser.id,
          },
          version: 1,
        });

        yield* events.append("modules", moduleAddedEvent);

        // Get all non-deleted units from the source module
        const sourceUnits = yield* state
          .from("units")
          .where({ moduleId: sourceModule.id, deletedAt: undefined })
          .orderBy({ order: "ASC" })
          .select()
          .mapError(() => new UnexpectedError());

        // Clone each unit
        for (const sourceUnit of sourceUnits) {
          const newUnitId = crypto.randomUUID();
          const unitAddedEvent = UnitAddedEvent.from({
            id: crypto.randomUUID(),
            streamId: newUnitId,
            payload: {
              title: sourceUnit.title,
              moduleId: newModuleId,
              order: sourceUnit.order,
              createdBy: currentUser.id,
            },
            version: 1,
          });

          yield* events.append("units", unitAddedEvent);

          // Clone text sections
          const textSections = yield* state
            .from("textSections")
            .where({ unitId: sourceUnit.id, deletedAt: undefined })
            .orderBy({ order: "ASC" })
            .select()
            .mapError(() => new UnexpectedError());

          for (const textSection of textSections) {
            const textSectionAddedEvent = TextSectionAddedEvent.from({
              id: crypto.randomUUID(),
              streamId: crypto.randomUUID(),
              payload: {
                unitId: newUnitId,
                order: textSection.order,
                content: textSection.content,
                createdBy: currentUser.id,
              },
              version: 1,
            });

            yield* events.append("textSections", textSectionAddedEvent);
          }

          // Clone video sections
          const videoSections = yield* state
            .from("videoSections")
            .where({ unitId: sourceUnit.id, deletedAt: undefined })
            .orderBy({ order: "ASC" })
            .select()
            .mapError(() => new UnexpectedError());

          for (const videoSection of videoSections) {
            const videoSectionAddedEvent = VideoSectionAddedEvent.from({
              id: crypto.randomUUID(),
              streamId: crypto.randomUUID(),
              payload: {
                unitId: newUnitId,
                order: videoSection.order,
                title: videoSection.title,
                content: videoSection.content,
                createdBy: currentUser.id,
              },
              version: 1,
            });

            yield* events.append("videoSections", videoSectionAddedEvent);
          }

          // Clone questionnaire sections
          const questionnaireSections = yield* state
            .from("questionnaireSections")
            .where({ unitId: sourceUnit.id, deletedAt: undefined })
            .orderBy({ order: "ASC" })
            .select()
            .mapError(() => new UnexpectedError());

          for (const questionnaireSection of questionnaireSections) {
            const questionnaireSectionAddedEvent =
              QuestionnaireSectionAddedEvent.from({
                id: crypto.randomUUID(),
                streamId: crypto.randomUUID(),
                payload: {
                  unitId: newUnitId,
                  order: questionnaireSection.order,
                  title: questionnaireSection.title,
                  content: questionnaireSection.content,
                  createdBy: currentUser.id,
                },
                version: 1,
              });

            yield* events.append(
              "questionnaireSections",
              questionnaireSectionAddedEvent,
            );
          }
        }
      }

      // Clone resources
      const sourceResources = yield* state
        .from("resources")
        .where({ courseId: sourceId })
        .select()
        .mapError(() => new UnexpectedError());

      for (const sourceResource of sourceResources) {
        const resourceCreatedEvent = ResourceCreatedEvent.from({
          id: crypto.randomUUID(),
          streamId: crypto.randomUUID(),
          payload: {
            courseId: newCourseId,
            title: sourceResource.title,
            description: sourceResource.description,
            url: sourceResource.url,
            type: sourceResource.type,
            createdBy: currentUser.id,
          },
          version: 1,
        });

        yield* events.append("resources", resourceCreatedEvent);
      }

      return { courseId: newCourseId };
    });
  },
});
