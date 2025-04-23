/* eslint-disable @typescript-eslint/no-explicit-any */

import type { Infer, Schema, SchemaParsingError } from "@fabric/core";
import { Effect, Result, TaggedError } from "@fabric/core";
import type { Permission } from "../security/permission.js";
import type { UserAccess } from "../services/auth-service.js";

export type UseCaseFunction<
  TDeps,
  TInput,
  TOutput,
  TError extends TaggedError,
> = (deps: TDeps, input: TInput) => Effect<TOutput, TError>;

export interface UseCaseAuth {
  isAuthRequired: boolean;
  requiredPermissions: Permission[];
}

export type UseCaseType = "command" | "query";

export interface DefaultDependencies {
  currentUser: UserAccess | undefined;
}

export type UseCaseOutput<TUseCase extends UseCase<any, any, any, any, any>> =
  TUseCase extends UseCase<any, any, any, infer TOutput, infer TError>
    ? Promise<Result<TOutput, TError>>
    : never;

export type UseCaseOkValue<TUseCase extends UseCase<any, any, any, any, any>> =
  TUseCase extends UseCase<any, any, any, infer TOutput, any> ? TOutput : never;

export type UseCaseErrorValue<
  TUseCase extends UseCase<any, any, any, any, any>,
> = TUseCase extends UseCase<any, any, any, any, infer TError> ? TError : never;

export type UseCaseName<TUseCase extends UseCase<any, any, any, any, any>> =
  TUseCase extends UseCase<infer TName, any, any, any, any> ? TName : never;

export type UseCaseInput<TUseCase extends UseCase<any, any, any, any, any>> =
  TUseCase extends UseCase<any, any, infer TInput, any, any>
    ? Infer<TInput>
    : never;

export interface QueryUseCaseDefinition<
  TName extends string,
  TDeps,
  TInputModel extends Schema,
  TOutput,
  TError extends TaggedError,
> {
  name: TName;
  type: UseCaseType;
  auth: UseCaseAuth;
  effect: UseCaseFunction<TDeps, Infer<TInputModel>, TOutput, TError>;
  inputSchema?: TInputModel;
}

export class UseCase<
  TName extends string,
  TDeps,
  TInputModel extends Schema,
  TOutput,
  TError extends TaggedError,
> {
  constructor(
    private readonly useCase: QueryUseCaseDefinition<
      TName,
      TDeps,
      TInputModel,
      TOutput,
      TError
    >,
  ) {}

  get name(): TName {
    return this.useCase.name;
  }

  get type(): UseCaseType {
    return this.useCase.type;
  }

  call(
    deps: TDeps & DefaultDependencies,
    input: unknown,
  ): Effect<
    TOutput,
    UnauthorizedError | SchemaParsingError<TInputModel> | TError
  > {
    return this.checkPermissions(deps.currentUser)
      .mapResult(
        () =>
          this.useCase.inputSchema?.parse(input) ??
          Result.ok(undefined as unknown as Infer<TInputModel>),
      )
      .flatMap((parsedInput) => this.useCase.effect(deps, parsedInput));
  }

  private checkPermissions(user?: UserAccess): Effect<void, UnauthorizedError> {
    if (!this.useCase.auth.isAuthRequired) {
      return Effect.ok();
    }

    if (!user) {
      return Effect.failWith(new UnauthorizedError());
    }

    const hasAllPermissions = this.useCase.auth.requiredPermissions.every(
      (permission) => user.permissions.includes(permission),
    );

    if (!hasAllPermissions) {
      return Effect.failWith(new UnauthorizedError());
    }

    return Effect.ok();
  }
}

export class UnauthorizedError extends TaggedError<"UnauthorizedError"> {
  constructor() {
    super("UnauthorizedError");
  }
}
