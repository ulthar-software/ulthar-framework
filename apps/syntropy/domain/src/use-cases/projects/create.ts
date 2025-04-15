import type { CryptoService, Infer } from "@fabric/core";
import { Field, Model, TaggedError, type UUID } from "@fabric/core";
import { ProjectCreatedEvent } from "../../models/project.js";
import type { DomainEventStore } from "../../services/event-store.js";
import type { DomainStateStore } from "../../services/state-store.js";
import type { DomainCommand } from "../domain-command.js";

export interface CreateProjectDependencies {
  state: DomainStateStore;
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
export type CreateProjectRequestModel = Infer<typeof CreateProjectRequestModel>;

export default {
  name: "createProject",
  isAuthRequired: true,
  permissions: ["CREATE_PROJECT"],
  useCase: (
    { state, crypto, currentUserId, events },
    { name, description },
  ) => {
    return state
      .from("projects")
      .where({ name })
      .assertNone()
      .errorMap(() => new ProjectNameInUseError())
      .flatMap(() =>
        events.append(
          "projects",
          ProjectCreatedEvent.from({
            id: crypto.randomUUID(),
            streamId: crypto.randomUUID(),
            version: 1n,
            payload: {
              name,
              description,
              userId: currentUserId,
            },
          }),
        ),
      );
  },
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
