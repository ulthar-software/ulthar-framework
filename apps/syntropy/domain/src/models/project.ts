import type { UUID } from "@fabric/core";
import {
  AggregateModel,
  EventStream,
  Field,
  VariantTag,
  withUpdate,
  type DomainEvent,
  type ModelToType,
} from "@fabric/core";

export const RepoProviders = {
  GITHUB: "github",
} as const;
export const RepoProviderValues = Object.values(RepoProviders);
export type RepoProviders = (typeof RepoProviders)[keyof typeof RepoProviders];

export const ProjectModel = new AggregateModel("projects", {
  name: Field.string(),
  description: Field.string(),
  userId: Field.reference({
    targetModel: "users",
  }),
  repositoryId: Field.string({
    isOptional: true,
  }),
  repositoryProvider: Field.enum({
    values: RepoProviderValues,
    isOptional: true,
  }),
});
export type ProjectModel = typeof ProjectModel;
export type Project = ModelToType<ProjectModel>;

export type ProjectCreatedEvent = DomainEvent<
  "ProjectCreated",
  {
    name: string;
    description: string;
    userId: UUID;
  }
>;

export type ProjectNameUpdatedEvent = DomainEvent<
  "ProjectNameUpdated",
  {
    name: string;
    userId: UUID;
  }
>;
export type ProjectDescriptionUpdatedEvent = DomainEvent<
  "ProjectDescriptionUpdated",
  {
    description: string;
    userId: UUID;
  }
>;

export type LinkedProjectToRepositoryEvent = DomainEvent<
  "LinkedProjectToRepository",
  {
    provider: RepoProviders;
    repositoryId: string;
    userId: UUID;
  }
>;

export type ProjectDeletedEvent = DomainEvent<"ProjectDeleted">;

export type ProjectEvents = ProjectCreatedEvent | UpdateProjectEvents;

export type UpdateProjectEvents =
  | LinkedProjectToRepositoryEvent
  | ProjectDescriptionUpdatedEvent
  | ProjectNameUpdatedEvent;

export const ProjectStream = new EventStream(
  ProjectModel,
  {
    createEvents: ["ProjectCreated"],
    updateEvents: [
      "LinkedProjectToRepository",
      "ProjectNameUpdated",
      "ProjectDescriptionUpdated",
    ],
    deleteEvents: ["ProjectDeleted"],
  },
  {
    create: (evt: ProjectCreatedEvent) => {
      return {
        id: evt.streamId,
        name: evt.payload.name,
        description: evt.payload.description,
        userId: evt.payload.userId,
        createdAt: evt.timestamp,
        updatedAt: evt.timestamp,
        version: 1n,
      };
    },
    update: (event: UpdateProjectEvents, project: Project) => {
      switch (event[VariantTag]) {
        case "LinkedProjectToRepository":
          return withUpdate(project, {
            repositoryProvider: event.payload.provider,
            repositoryId: event.payload.repositoryId,
            version: event.version,
            updatedAt: event.timestamp,
          });
        case "ProjectNameUpdated":
          return withUpdate(project, {
            name: event.payload.name,
            version: event.version,
            updatedAt: event.timestamp,
          });
        case "ProjectDescriptionUpdated":
          return withUpdate(project, {
            description: event.payload.description,
            version: event.version,
            updatedAt: event.timestamp,
          });
        default: {
          const exhaustiveCheck: never = event;
          return exhaustiveCheck;
        }
      }
    },
  },
);
