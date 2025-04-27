import {
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  ChangeCourseDescriptionUseCase,
  ChangeCourseTitleUseCase,
  ChangeModuleOrderUseCase,
  CreateCourseUseCase,
  CreateTagUseCase,
  EnrollStudentInCourseUseCase,
  GetAllCoursesUseCase,
  GetCourseDetailsUseCase,
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
] as const;

export type UseCases = typeof UseCases;
