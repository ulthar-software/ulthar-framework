import { ClearPasswordResetRequestUseCase } from "./use-cases/index.js";
import { Schedule, type ScheduledUseCase } from "./utils/schedule.js";
import type { UseCaseDependencies } from "./utils/use-case.js";

export const scheduledUseCases = [
  Schedule.everyHour(ClearPasswordResetRequestUseCase),
] as const satisfies ScheduledUseCase[];

export type ScheduledUseCases = (typeof scheduledUseCases)[number]["useCase"];
export type ScheduledUseCaseDependencies =
  UseCaseDependencies<ScheduledUseCases>;
