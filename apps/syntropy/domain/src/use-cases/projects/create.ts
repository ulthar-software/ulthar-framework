import type { CryptoService, ModelToType } from "@fabric/core";
import { Field, Model, PosixDate, TaggedError, type UUID } from "@fabric/core";
import type { ProjectCreatedEvent } from "../../models/project.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { ReadValueStore } from "../../services/state-store.js";
import type { DomainCommand } from "../domain-command.js";

export interface CreateProjectDependencies {
  state: ReadValueStore;
  crypto: CryptoService;
  currentUserId: UUID;
  events: DomainEventStore;
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

export default {
  name: "createProject",
  isAuthRequired: true,
  permissions: ["CREATE_PROJECT"],
  useCase: ({ state, crypto, currentUserId, events }, { name, description }) =>
    state
      .from("projects")
      .where({ name })
      .assertNone()
      .errorMap(() => new ProjectNameInUseError())
      .flatMap(() =>
        events.append("projects", {
          _tag: "ProjectCreated",
          id: crypto.randomUUID(),
          streamId: crypto.randomUUID(),
          timestamp: new PosixDate(),
          payload: {
            name,
            description,
            userId: currentUserId,
          },
          version: 1n,
        }),
      ),
} as const satisfies DomainCommand<
  CreateProjectDependencies,
  CreateProjectRequestModel,
  ProjectCreatedEvent,
  ProjectNameInUseError
>;

export class ProjectNameInUseError extends TaggedError<"ProjectNameInUseError"> {
  constructor() {
    super("ProjectNameInUseError");
  }
}
