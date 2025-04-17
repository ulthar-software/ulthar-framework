import { CourseModel, CourseProjector, CourseStream } from "./course.js";
import { ModuleModel, ModuleProjector, ModuleStream } from "./module.js";
import {
  QuestionnaireSectionModel,
  QuestionnaireSectionProjector,
  QuestionnaireSectionStream,
  TextSectionModel,
  TextSectionProjector,
  TextSectionStream,
  VideoSectionModel,
  VideoSectionProjector,
  VideoSectionStream,
} from "./sections/index.js";

import { UnitModel, UnitProjector, UnitStream } from "./unit.js";
import {
  UserInviteModel,
  UserInviteProjector,
  UserInviteStream,
} from "./user-invite.js";
import { UserModel, UserProjector, UserStream } from "./user.js";

export * from "./course.js";
export * from "./module.js";
export * from "./sections/index.js";
export * from "./unit.js";
export * from "./user-invite.js";
export * from "./user.js";

export const DomainModels = [
  UserModel,
  UserInviteModel,
  CourseModel,
  ModuleModel,
  UnitModel,
  TextSectionModel,
  VideoSectionModel,
  QuestionnaireSectionModel,
] as const;

export const DomainStreams = [
  UserStream,
  UserInviteStream,
  CourseStream,
  ModuleStream,
  UnitStream,
  TextSectionStream,
  VideoSectionStream,
  QuestionnaireSectionStream,
] as const;

export const DomainProjectors = [
  UserProjector,
  UserInviteProjector,
  CourseProjector,
  ModuleProjector,
  UnitProjector,
  TextSectionProjector,
  VideoSectionProjector,
  QuestionnaireSectionProjector,
] as const;
