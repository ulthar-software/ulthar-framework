import { LoginUseCase } from "./use-cases/auth/login.js";
import { AddModuleToCourseUseCase } from "./use-cases/course/add-module-to-course.js";
import { CreateCourseUseCase } from "./use-cases/course/create-course.js";
import { InviteUserUseCase } from "./use-cases/user/invite-user.js";

export const UseCases = [
  LoginUseCase,
  InviteUserUseCase,
  CreateCourseUseCase,
  AddModuleToCourseUseCase,
] as const;

export type UseCases = typeof UseCases;
