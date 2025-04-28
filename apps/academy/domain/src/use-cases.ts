import { UnexpectedError, type ClassConstructor } from "@fabric/core";
import {
  AddModuleToCourseUseCase,
  AddQuestionnaireResponseUseCase,
  AddQuestionnaireSectionToUnitUseCase,
  AddTextSectionToUnitUseCase,
  AddUnitToModuleUseCase,
  AddVideoSectionToUnitUseCase,
  BatchEnrollmentFailedError,
  ChangeCourseDescriptionUseCase,
  ChangeCourseTitleUseCase,
  ChangeModuleOrderUseCase,
  CourseNotFoundError,
  CreateCourseUseCase,
  CreateTagUseCase,
  EnrollStudentInCourseUseCase,
  EnrollUsersByEmailUseCase,
  GetAllCoursesUseCase,
  GetCourseDetailsUseCase,
  GetQuestionnaireResponseUseCase,
  GetResourcesByUnitTagsUseCase,
  GetUnitWithSectionsUseCase,
  IncompleteQuestionnaireResponseError,
  InvalidCredentialsError,
  InviteUserUseCase,
  LoginUseCase,
  ModuleNotFoundError,
  NotEnrolledInCourseError,
  QuestionnaireResponseNotFoundError,
  QuestionnaireSectionNotFoundError,
  QuestionnaireVersionMismatchError,
  StudentAlreadyEnrolledError,
  TagAlreadyExistsError,
  UnitNotFoundError,
  UserAlreadyExistsError,
  UserAlreadyInvitedError,
} from "./use-cases/index.js";
import type { UseCaseErrorValue } from "./utils/use-case.js";

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
] as const;

export type DomainUseCases = typeof DomainUseCases;

export type DomainUseCaseErrors = UseCaseErrorValue<DomainUseCases[number]>;

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
} as const satisfies Record<
  DomainUseCaseErrors["_tag"],
  ClassConstructor<DomainUseCaseErrors>
>;
export type DomainUseCaseErrorsMap = typeof DomainUseCaseErrorsMap;
