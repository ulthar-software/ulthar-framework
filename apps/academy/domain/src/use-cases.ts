import { GetCourseDetailsUseCase } from "./use-cases/course/get-course-details.js";
import {
  AddModuleToCourseUseCase,
  AddUnitToModuleUseCase,
  ChangeCourseDescriptionUseCase,
  ChangeCourseTitleUseCase,
  ChangeModuleOrderUseCase,
  CreateCourseUseCase,
  EnrollStudentInCourseUseCase,
  GetAllCoursesUseCase,
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
] as const;

export type UseCases = typeof UseCases;
