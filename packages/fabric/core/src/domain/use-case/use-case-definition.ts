import { TaggedError } from "../../error/tagged-error.js";
import { UseCase } from "./use-case.js";

export type UseCaseDefinition<
  TDependencies,
  TPayload,
  TOutput,
  TErrors extends TaggedError<string>,
> = TPayload extends undefined
  ? {
      /**
       * The use case name.
       */
      name: string;

      /**
       * Whether the use case requires authentication or not.
       */
      isAuthRequired?: boolean;

      /**
       * The required permissions to execute the use case.
       */
      requiredPermissions?: string[];

      /**
       * The use case function.
       */
      useCase: UseCase<TDependencies, TPayload, TOutput, TErrors>;
    }
  : {
      /**
       * The use case name.
       */
      name: string;

      /**
       * Whether the use case requires authentication or not.
       */
      isAuthRequired?: boolean;

      /**
       * The required permissions to execute the use case.
       */
      requiredPermissions?: string[];

      /**
       * The use case function.
       */
      useCase: UseCase<TDependencies, TPayload, TOutput, TErrors>;
    };
