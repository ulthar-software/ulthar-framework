import type { EventToType } from "@fabric/core";
import {
  AggregateModel,
  AggregateProjector,
  DomainEvent,
  EventStream,
  Field,
  type Infer,
} from "@fabric/core";
import { UserModel } from "./user.js";

export const RepoProviders = {
  GITHUB: "github",
} as const;
export const RepoProviderValues = Object.values(RepoProviders);
export type RepoProviders = (typeof RepoProviders)[keyof typeof RepoProviders];

export const ProjectModel = new AggregateModel("projects", {
  name: Field.string(),
  description: Field.string(),
  userId: Field.reference({
    targetModel: UserModel.name,
  }),
  repositoryId: Field.string({
    isOptional: true,
  }),
  repositoryProvider: Field.enum({
    values: RepoProviderValues,
    isOptional: true,
  }),
});
export type Project = Infer<typeof ProjectModel>;

export const ProjectCreatedEvent = new DomainEvent("ProjectCreated", {
  name: Field.string(),
  description: Field.string(),
  userId: Field.uuid(),
});
export type ProjectCreatedEvent = EventToType<typeof ProjectCreatedEvent>;

export const ProjectNameUpdatedEvent = new DomainEvent("ProjectNameUpdated", {
  name: Field.string(),
  userId: Field.uuid(),
});
export type ProjectNameUpdatedEvent = EventToType<
  typeof ProjectNameUpdatedEvent
>;

export const ProjectDescriptionUpdatedEvent = new DomainEvent(
  "ProjectDescriptionUpdated",
  {
    description: Field.string(),
    userId: Field.reference({
      targetModel: "users",
    }),
  },
);
export type ProjectDescriptionUpdatedEvent = EventToType<
  typeof ProjectDescriptionUpdatedEvent
>;

export const LinkedProjectToRepositoryEvent = new DomainEvent(
  "LinkedProjectToRepository",
  {
    provider: Field.enum({
      values: RepoProviderValues,
    }),
    repositoryId: Field.string(),
    userId: Field.reference({
      targetModel: "users",
    }),
  },
);
export type LinkedProjectToRepositoryEvent = EventToType<
  typeof LinkedProjectToRepositoryEvent
>;
export const ProjectDeletedEvent = new DomainEvent("ProjectDeleted", {
  deletedBy: Field.uuid(),
});
export type ProjectDeletedEvent = EventToType<typeof ProjectDeletedEvent>;

export const ProjectEvents = [
  ProjectCreatedEvent,
  ProjectNameUpdatedEvent,
  ProjectDescriptionUpdatedEvent,
  LinkedProjectToRepositoryEvent,
  ProjectDeletedEvent,
] as const;

export const ProjectStream = new EventStream("projects", ProjectEvents);

export const ProjectProjector = new AggregateProjector(
  ProjectStream.name,
  ProjectModel,
  ProjectEvents,
  {
    ProjectCreated: (event) =>
      ProjectModel.from(event, {
        name: event.payload.name,
        description: event.payload.description,
        userId: event.payload.userId,
      }),
    ProjectNameUpdated: (event, project) =>
      ProjectModel.update(project, event, {
        name: event.payload.name,
      }),
    ProjectDescriptionUpdated: (event, project) =>
      ProjectModel.update(project, event, {
        description: event.payload.description,
      }),
    LinkedProjectToRepository: (event, project) =>
      ProjectModel.update(project, event, {
        repositoryId: event.payload.repositoryId,
        repositoryProvider: event.payload.provider,
      }),
    ProjectDeleted: () => null,
  },
);
