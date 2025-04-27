import {
  AddModuleToCourseUseCase,
  AddQuestionnaireResponseUseCase,
  AddUnitToModuleUseCase,
  ChangeCourseDescriptionUseCase,
  ChangeCourseTitleUseCase,
  ChangeModuleOrderUseCase,
  CreateCourseUseCase,
  CreateTagUseCase,
  EnrollStudentInCourseUseCase,
  GetAllCoursesUseCase,
  GetCourseDetailsUseCase,
  GetQuestionnaireResponseUseCase,
  GetResourcesByUnitTagsUseCase,
  GetUnitWithSectionsUseCase,
  InviteUserUseCase,
  LoginUseCase,
} from "./use-cases/index.js";

export const UseCases = [
  LoginUseCase,
  InviteUserUseCase,
  CreateCourseUseCase,
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  ChangeCourseTitleUseCase,
  ChangeCourseDescriptionUseCase,
  ChangeModuleOrderUseCase,
  EnrollStudentInCourseUseCase,
  GetAllCoursesUseCase,
  GetCourseDetailsUseCase,
  GetUnitWithSectionsUseCase,
  CreateTagUseCase,
  GetResourcesByUnitTagsUseCase,
  AddQuestionnaireResponseUseCase,
  GetQuestionnaireResponseUseCase,
] as const;

export type UseCases = typeof UseCases;
