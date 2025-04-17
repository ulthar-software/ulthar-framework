import {
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  CreateCourseUseCase,
  EditCourseUseCase,
  InviteUserUseCase,
  LoginUseCase,
} from "./use-cases/index.js";

export const UseCases = [
  LoginUseCase,
  InviteUserUseCase,
  CreateCourseUseCase,
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  EditCourseUseCase,
] as const;

export type UseCases = typeof UseCases;
