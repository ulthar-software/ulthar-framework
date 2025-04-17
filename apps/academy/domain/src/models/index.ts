import { CourseModel, CourseProjector, CourseStream } from "./course.js";
import { ModuleModel, ModuleProjector, ModuleStream } from "./module.js";
import { SectionModel, SectionProjector, SectionStream } from "./section.js";
import { UnitModel, UnitProjector, UnitStream } from "./unit.js";
import {
  UserInviteModel,
  UserInviteProjector,
  UserInviteStream,
} from "./user-invite.js";
import { UserModel, UserProjector, UserStream } from "./user.js";

export * from "./course.js";
export * from "./module.js";
export * from "./section.js";
export * from "./unit.js";
export * from "./user-invite.js";
export * from "./user.js";

export const DomainModels = [
  UserModel,
  UserInviteModel,
  CourseModel,
  ModuleModel,
  UnitModel,
  SectionModel,
] as const;

export const DomainStreams = [
  UserStream,
  UserInviteStream,
  CourseStream,
  ModuleStream,
  UnitStream,
  SectionStream,
] as const;

export const DomainProjectors = [
  UserProjector,
  UserInviteProjector,
  CourseProjector,
  ModuleProjector,
  UnitProjector,
  SectionProjector,
] as const;
