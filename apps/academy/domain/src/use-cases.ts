import {
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  ChangeCourseDescriptionUseCase,
  ChangeCourseTitleUseCase,
  ChangeModuleOrderUseCase,
  CreateCourseUseCase,
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
] as const;

export type UseCases = typeof UseCases;
