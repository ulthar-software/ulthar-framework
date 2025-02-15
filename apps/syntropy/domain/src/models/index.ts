import { ProjectModel, ProjectStream } from "./project.js";
import { UserModel, UserStream } from "./user.js";
export * from "./project.js";
export * from "./user.js";

export const DomainModels = [UserModel, ProjectModel];

export type DomainModels = (typeof DomainModels)[number];

export const DomainStreams = [ProjectStream, UserStream];

export type DomainStreams = (typeof DomainStreams)[number];
