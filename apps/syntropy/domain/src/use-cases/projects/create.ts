import { TaggedError, type UUID } from "@fabric/core";
import type { Command, DomainEvent, UUIDGenerator } from "@fabric/domain";
import { Field, Model, type ModelToType } from "@fabric/models";
import type { ReadValueStore } from "../../services/state-store.js";

export interface CreateProjectDependencies {
  state: ReadValueStore;
  uuid: UUIDGenerator;
  currentUserId: UUID;
}

export const CreateProjectRequestModel = new Model(
  "CreateProjectRequestModel",
  {
    name: Field.string({}),
    description: Field.string({}),
  },
);
export type CreateProjectRequestModel = ModelToType<
  typeof CreateProjectRequestModel
>;

export type ProjectCreatedEvent = DomainEvent<
  "ProjectCreated",
  {
    id: string;
    name: string;
    description: string;
    userId: string;
  }
>;

export type CreateProjectErrors = ProjectNameInUseError;

export default {
  name: "createProject",
  isAuthRequired: true,
  useCase: ({ state, uuid, currentUserId }, { name, description }) =>
    state
      .from("projects")
      .where({ name })
      .assertNone()
      .errorMap(() => new ProjectNameInUseError())
      .map(() => {
        const newEventId = uuid.generate();
        const newProjectId = uuid.generate();

        return {
          _tag: "ProjectCreated",
          id: newEventId,
          streamId: newProjectId,
          payload: {
            id: newProjectId,
            name,
            description,
            userId: currentUserId,
          },
        };
      }),
} as const satisfies Command<
  CreateProjectDependencies,
  CreateProjectRequestModel,
  ProjectCreatedEvent,
  CreateProjectErrors
>;

export class ProjectNameInUseError extends TaggedError<"ProjectNameInUseError"> {
  constructor() {
    super("ProjectNameInUseError");
  }
}
