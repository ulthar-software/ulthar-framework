import type { Infer, SchemaParsingError } from "@fabric/core";
import { Effect, TaggedError, type Model } from "@fabric/core";
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

export interface QueryUseCaseDefinition<
  TDeps,
  TInputModel extends Model,
  TOutput,
  TError extends TaggedError,
> {
  name: string;
  type: UseCaseType;
  auth: UseCaseAuth;
  effect: UseCaseFunction<TDeps, Infer<TInputModel>, TOutput, TError>;
  inputSchema: TInputModel;
}

export class UseCase<
  TDeps,
  TInputModel extends Model,
  TOutput,
  TError extends TaggedError,
> {
  constructor(
    private readonly useCase: QueryUseCaseDefinition<
      TDeps,
      TInputModel,
      TOutput,
      TError
    >,
  ) {}

  get name(): string {
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
      .mapResult(() => this.useCase.inputSchema.parse(input))
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
