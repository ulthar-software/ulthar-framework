import { CourseModel, CourseProjector, CourseStream } from "./course.js";
import {
  EmailQueueModel,
  EmailQueueProjector,
  EmailQueueStream,
} from "./email-queue.js";
import {
  EnrollmentModel,
  EnrollmentProjector,
  EnrollmentStream,
} from "./enrollment.js";
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

import {
  PasswordResetRequestModel,
  PasswordResetRequestProjector,
  PasswordResetRequestStream,
} from "./password-reset.js";
import {
  QuestionnaireResponseModel,
  QuestionnaireResponseProjector,
  QuestionnaireResponseStream,
} from "./questionnaire-response.js";
import {
  ResourceTagModel,
  ResourceTagProjector,
  ResourceTagStream,
} from "./resource-tag.js";
import {
  ResourceModel,
  ResourceProjector,
  ResourceStream,
} from "./resource.js";
import { TagModel, TagProjector, TagStream } from "./tag.js";
import { UnitTagModel, UnitTagProjector, UnitTagStream } from "./unit-tag.js";
import { UnitModel, UnitProjector, UnitStream } from "./unit.js";
import {
  UserInviteModel,
  UserInviteProjector,
  UserInviteStream,
} from "./user-invite.js";
import { UserModel, UserProjector, UserStream } from "./user.js";

export * from "./course.js";
export * from "./email-queue.js";
export * from "./enrollment.js";
export * from "./module.js";
export * from "./password-reset.js";
export * from "./resource-tag.js";
export * from "./resource.js";
export * from "./sections/index.js";
export * from "./tag.js";
export * from "./unit-tag.js";
export * from "./unit.js";
export * from "./user-invite.js";
export * from "./user.js";
export * from "./utils/index.js";

export const DomainModels = [
  UserModel,
  UserInviteModel,
  CourseModel,
  ModuleModel,
  UnitModel,
  TextSectionModel,
  VideoSectionModel,
  QuestionnaireSectionModel,
  EnrollmentModel,
  ResourceModel,
  TagModel,
  ResourceTagModel,
  UnitTagModel,
  QuestionnaireResponseModel,
  EmailQueueModel,
  PasswordResetRequestModel,
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
  EnrollmentStream,
  ResourceStream,
  TagStream,
  ResourceTagStream,
  UnitTagStream,
  QuestionnaireResponseStream,
  EmailQueueStream,
  PasswordResetRequestStream,
] as const;

export type DomainEvents = (typeof DomainStreams)[number]["events"][number];

export const DomainProjectors = [
  UserProjector,
  UserInviteProjector,
  CourseProjector,
  ModuleProjector,
  UnitProjector,
  TextSectionProjector,
  VideoSectionProjector,
  QuestionnaireSectionProjector,
  EnrollmentProjector,
  ResourceProjector,
  TagProjector,
  ResourceTagProjector,
  UnitTagProjector,
  QuestionnaireResponseProjector,
  EmailQueueProjector,
  PasswordResetRequestProjector,
] as const;
