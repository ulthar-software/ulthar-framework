/* eslint-disable @typescript-eslint/no-explicit-any */

import type { UseCase } from "./use-case.js";

export interface ScheduledUseCase<
  TUseCase extends UseCase<any, any, any, any, any> = UseCase<
    any,
    any,
    any,
    any,
    any
  >,
> {
  cronExpression: string;
  useCase: TUseCase;
}

export namespace Schedule {
  export function everyHour<TUseCase extends UseCase<any, any, any, any, any>>(
    useCase: TUseCase,
  ): ScheduledUseCase<TUseCase> {
    return {
      cronExpression: "0 * * * *",
      useCase,
    };
  }
  export function everyMinute<
    TUseCase extends UseCase<any, any, any, any, any>,
  >(useCase: TUseCase): ScheduledUseCase<TUseCase> {
    return {
      cronExpression: "* * * * *",
      useCase,
    };
  }
  export function everySecond<
    TUseCase extends UseCase<any, any, any, any, any>,
  >(useCase: TUseCase): ScheduledUseCase<TUseCase> {
    return {
      cronExpression: "* * * * * *",
      useCase,
    };
  }
}
