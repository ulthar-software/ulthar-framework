import { CourseModel, CourseProjector, CourseStream } from "./course.js";
import {
  UserInviteModel,
  UserInviteProjector,
  UserInviteStream,
} from "./user-invite.js";
import { UserModel, UserProjector, UserStream } from "./user.js";

export * from "./course.js";
export * from "./user.js";

export const DomainModels = [UserModel, UserInviteModel, CourseModel] as const;

export const DomainStreams = [
  UserStream,
  UserInviteStream,
  CourseStream,
] as const;

export const DomainProjectors = [
  UserProjector,
  UserInviteProjector,
  CourseProjector,
] as const;
