import type { UnionToIntersection } from "@fabric/core";
import {
  AlreadyExistsError,
  UnexpectedError,
  type ClassConstructor,
} from "@fabric/core";
import type { ScheduledUseCaseDependencies } from "./schedules.js";
import {
  ExpiredTokenError,
  InvalidTokenError,
} from "./services/auth-service.js";
import {
  AddModuleToCourseUseCase,
  AddQuestionnaireResponseUseCase,
  AddQuestionnaireSectionToUnitUseCase,
  AddResourceToCourseUseCase,
  AddTagToResourceUseCase,
  AddTagToUnitUseCase,
  AddTextSectionToUnitUseCase,
  AddUnitToModuleUseCase,
  AddVideoSectionToUnitUseCase,
  BatchEnrollmentFailedError,
  ChangeCourseDescriptionUseCase,
  ChangeCourseTitleUseCase,
  ChangeModuleOrderUseCase,
  ChangeModuleTitleUseCase,
  ChangeUnitTitleUseCase,
  CourseNotFoundError,
  CreateCourseUseCase,
  CreateTagUseCase,
  EditQuestionnaireSectionContentUseCase,
  EditResourceUseCase,
  EditTextSectionContentUseCase,
  EditVideoSectionContentUseCase,
  EmptyCourseError,
  EnrollStudentInCourseUseCase,
  EnrollUsersByEmailUseCase,
  GetAllCoursesUseCase,
  GetCourseDetailsUseCase,
  GetCourseEnrollmentsUseCase,
  GetCurrentUserUseCase,
  GetQuestionnaireResponseUseCase,
  GetResourcesByUnitTagsUseCase,
  GetTagsUseCase,
  GetUnitWithSectionsUseCase,
  IncompleteQuestionnaireResponseError,
  InvalidCredentialsError,
  InvalidInviteCodeError,
  InvalidPasswordResetTokenError,
  InviteUserUseCase,
  ListUserInvitesUseCase,
  ListUsersUseCase,
  LoginUseCase,
  ModuleNotFoundError,
  NotEnrolledInCourseError,
  QuestionnaireResponseNotFoundError,
  QuestionnaireSectionNotFoundError,
  QuestionnaireVersionMismatchError,
  RegisterUserUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
  ResourceNotFoundError,
  StudentAlreadyEnrolledError,
  TagAlreadyExistsError,
  UnitNotFoundError,
  UserAlreadyExistsError,
  UserAlreadyInvitedError,
  UserNotFoundError,
} from "./use-cases/index.js";
import type {
  UseCaseDependencies,
  UseCaseErrorValue,
} from "./utils/use-case.js";
import { UnauthorizedError } from "./utils/use-case.js";

export const DomainUseCases = [
  LoginUseCase,
  InviteUserUseCase,
  CreateCourseUseCase,
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  ChangeCourseTitleUseCase,
  ChangeCourseDescriptionUseCase,
  ChangeModuleOrderUseCase,
  EnrollStudentInCourseUseCase,
  EnrollUsersByEmailUseCase,
  GetAllCoursesUseCase,
  GetCourseDetailsUseCase,
  GetUnitWithSectionsUseCase,
  CreateTagUseCase,
  GetResourcesByUnitTagsUseCase,
  AddQuestionnaireResponseUseCase,
  GetQuestionnaireResponseUseCase,
  AddTextSectionToUnitUseCase,
  AddVideoSectionToUnitUseCase,
  AddQuestionnaireSectionToUnitUseCase,
  RegisterUserUseCase,
  GetTagsUseCase,
  ChangeModuleTitleUseCase,
  GetCurrentUserUseCase,
  ListUsersUseCase,
  ListUserInvitesUseCase,
  ChangeUnitTitleUseCase,
  EditVideoSectionContentUseCase,
  EditTextSectionContentUseCase,
  EditQuestionnaireSectionContentUseCase,
  GetCourseEnrollmentsUseCase,
  AddResourceToCourseUseCase,
  EditResourceUseCase,
  AddTagToResourceUseCase,
  AddTagToUnitUseCase,
  RequestPasswordResetUseCase,
  ResetPasswordUseCase,
] as const;

export type DomainUseCases = typeof DomainUseCases;

export type DomainUseCaseErrors =
  | UseCaseErrorValue<DomainUseCases[number]>
  | InvalidTokenError
  | UnauthorizedError
  | ExpiredTokenError;

export const DomainUseCaseErrorsMap = {
  UnexpectedError: UnexpectedError,
  InvalidCredentialsError: InvalidCredentialsError,
  UserAlreadyExistsError: UserAlreadyExistsError,
  UserAlreadyInvitedError: UserAlreadyInvitedError,
  CourseNotFoundError: CourseNotFoundError,
  ModuleNotFoundError: ModuleNotFoundError,
  StudentAlreadyEnrolledError: StudentAlreadyEnrolledError,
  BatchEnrollmentFailedError: BatchEnrollmentFailedError,
  NotEnrolledInCourseError: NotEnrolledInCourseError,
  UnitNotFoundError: UnitNotFoundError,
  TagAlreadyExistsError: TagAlreadyExistsError,
  QuestionnaireSectionNotFoundError: QuestionnaireSectionNotFoundError,
  QuestionnaireVersionMismatchError: QuestionnaireVersionMismatchError,
  IncompleteQuestionnaireResponseError: IncompleteQuestionnaireResponseError,
  QuestionnaireResponseNotFoundError: QuestionnaireResponseNotFoundError,
  InvalidInviteCodeError: InvalidInviteCodeError,
  InvalidTokenError: InvalidTokenError,
  ExpiredTokenError: ExpiredTokenError,
  UnauthorizedError: UnauthorizedError,
  EmptyCourseError: EmptyCourseError,
  UserNotFoundError: UserNotFoundError,
  ResourceNotFoundError: ResourceNotFoundError,
  TagNotFoundError: ResourceNotFoundError,
  AlreadyExistsError: AlreadyExistsError,
  InvalidPasswordResetTokenError: InvalidPasswordResetTokenError,
} as const satisfies Record<
  DomainUseCaseErrors["_tag"],
  ClassConstructor<DomainUseCaseErrors>
>;
export type DomainUseCaseErrorsMap = typeof DomainUseCaseErrorsMap;

export type DomainDependencies = Omit<
  UnionToIntersection<
    UseCaseDependencies<DomainUseCases[number]> | ScheduledUseCaseDependencies
  >,
  "currentUser"
>;
