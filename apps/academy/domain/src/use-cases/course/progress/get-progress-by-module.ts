import type { Infer, UnexpectedError } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { EnrollmentModel } from "../../../models/enrollment.js";
import { QuestionnaireSectionModel } from "../../../models/index.js";
import { ModuleModel } from "../../../models/module.js";
import { QuestionnaireResponseModel } from "../../../models/questionnaire-response.js";
import { UnitModel } from "../../../models/unit.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { ModuleNotFoundError } from "../errors.js";

export const GetProgressByModuleInputModel = new Schema({
  moduleId: Field.uuid(),
});
export type GetProgressByModuleInput = Infer<
  typeof GetProgressByModuleInputModel
>;

export interface GetProgressByModuleDependencies {
  state: DomainStateStore;
}

export interface GetProgressByModuleOutput {
  progress: number;
}

export const GetProgressByModuleUseCase = new UseCase({
  auth: AccessPolicy.WithPermission("LIST_USERS"),
  name: "getProgressByModule",
  type: "query",
  inputSchema: GetProgressByModuleInputModel,
  effect: (
    { state }: GetProgressByModuleDependencies,
    { moduleId }: GetProgressByModuleInput,
  ): Effect<
    GetProgressByModuleOutput,
    UnexpectedError | ModuleNotFoundError
  > => {
    return Effect.fromGen(function* () {
      const courseId = yield* state
        .from("modules")
        .where({ id: moduleId, deletedAt: undefined })
        .selectOneOrFail(["courseId"])
        .map((row) => row.courseId)
        .mapError(() => new ModuleNotFoundError(moduleId));

      const moduleQuizzes = yield* state
        .from("questionnaireSections")
        .innerJoin({
          model: UnitModel,
          as: "u",
          on: { left: "unitId", right: "id" },
        })
        .innerJoin({
          model: ModuleModel,
          as: "m",
          on: { left: "u.moduleId", right: "id" },
        })
        .where({
          "m.id": moduleId,
          "m.deletedAt": undefined,
          "u.deletedAt": undefined,
          deletedAt: undefined,
        })
        .count();

      const userEnrolledInCourse = yield* state
        .from("users")
        .innerJoin({
          model: EnrollmentModel,
          as: "e",
          on: { left: "id", right: "userId" },
        })
        .where({ "e.courseId": courseId })
        .count();

      const fullQuizzes = yield* state
        .from("users")
        .innerJoin({
          model: QuestionnaireResponseModel,
          as: "qr",
          on: { left: "id", right: "userId" },
        })
        .innerJoin({
          model: QuestionnaireSectionModel,
          as: "qs",
          on: { left: "qr.questionnaireId", right: "id" },
        })
        .innerJoin({
          model: UnitModel,
          as: "u",
          on: { left: "qs.unitId", right: "id" },
        })
        .innerJoin({
          model: ModuleModel,
          as: "m",
          on: { left: "u.moduleId", right: "id" },
        })
        .where({
          "m.id": moduleId,
          "m.deletedAt": undefined,
          "u.deletedAt": undefined,
          "qs.deletedAt": undefined,
        })
        .select([
          "qr.questionnaireVersion",
          "qs.version",
          "qs.title",
          "qr.score",
          "qr.userId",
        ])
        .map((rows) => {
          return rows
            .filter(
              (row) => row["qr.questionnaireVersion"] === row["qs.version"],
            )
            .map((row) => row["qr.score"])
            .filter((score) => score === 100);
        });

      return {
        progress:
          (fullQuizzes.length / (moduleQuizzes * userEnrolledInCourse)) * 100 ||
          0,
      };
    });
  },
});
