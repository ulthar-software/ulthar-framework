import {
  Effect,
  Field,
  Schema,
  UnexpectedError,
  type Infer,
} from "@fabric/core";
import type { QuestionnaireResponse } from "../../models/questionnaire-response.js";
import { AccessPolicy } from "../../security/access-policy.js";
import type { UserAccess } from "../../services/auth-service.js";
import type { DomainStateStore } from "../../services/state-store.js";
import { UseCase } from "../../utils/use-case.js";
import { QuestionnaireResponseNotFoundError } from "./errors.js";

export interface GetQuestionnaireResponseDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export const GetQuestionnaireResponseInputModel = new Schema({
  questionnaireId: Field.uuid(),
});

export type GetQuestionnaireResponseInput = Infer<
  typeof GetQuestionnaireResponseInputModel
>;

export interface GetQuestionnaireResponseOutput {
  response: QuestionnaireResponse;
}

export const GetQuestionnaireResponseUseCase = new UseCase({
  name: "getQuestionnaireResponse",
  type: "query",
  auth: AccessPolicy.Authenticated(),
  inputSchema: GetQuestionnaireResponseInputModel,
  effect: (
    { state, currentUser }: GetQuestionnaireResponseDependencies,
    { questionnaireId }: GetQuestionnaireResponseInput,
  ): Effect<
    GetQuestionnaireResponseOutput,
    QuestionnaireResponseNotFoundError | UnexpectedError
  > => {
    // Query the state store to find the response for the current user and questionnaire
    return state
      .from("questionnaireResponses")
      .where({ questionnaireId, userId: currentUser.id })
      .selectOne()
      .mapError((e) => new UnexpectedError(e.message))
      .flatMap((maybeResponse) => {
        if (maybeResponse.isValue()) {
          return Effect.ok({
            response: maybeResponse.value,
          });
        } else {
          return Effect.failWith(
            new QuestionnaireResponseNotFoundError(
              questionnaireId,
              currentUser.id,
            ),
          );
        }
      });
  },
});
