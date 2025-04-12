import { ProjectModel, ProjectProjector, ProjectStream } from "./project.js";
import { UserModel, UserProjector, UserStream } from "./user.js";
export * from "./project.js";
export * from "./user.js";

export const DomainModels = [UserModel, ProjectModel] as const;

export const DomainStreams = [ProjectStream, UserStream] as const;

export const DomainProjectors = [UserProjector, ProjectProjector] as const;
