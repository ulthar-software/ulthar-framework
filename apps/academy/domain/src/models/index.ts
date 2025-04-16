import { CourseModel, CourseProjector, CourseStream } from "./course.js";
import { ModuleModel, ModuleProjector, ModuleStream } from "./module.js";
import {
  UserInviteModel,
  UserInviteProjector,
  UserInviteStream,
} from "./user-invite.js";
import { UserModel, UserProjector, UserStream } from "./user.js";

export * from "./course.js";
export * from "./module.js";
export * from "./user.js";

export const DomainModels = [
  UserModel,
  UserInviteModel,
  CourseModel,
  ModuleModel,
] as const;

export const DomainStreams = [
  UserStream,
  UserInviteStream,
  CourseStream,
  ModuleStream,
] as const;

export const DomainProjectors = [
  UserProjector,
  UserInviteProjector,
  CourseProjector,
  ModuleProjector,
] as const;
