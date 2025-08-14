import type { Effect, StoreQueryError, UUID } from "@fabric/core";
import type { DomainStateStore } from "../../services/state-store.js";
import { ModuleModel } from "../module.js";
import { QuestionnaireResponseModel } from "../questionnaire-response.js";
import { QuestionnaireSectionModel } from "../sections/questionnaire-section.js";
import { UnitModel } from "../unit.js";

export function getStudentProgressInCourse(
  state: DomainStateStore,
  courseId: UUID,
  userId: UUID,
): Effect<
  {
    responseVersion: number;
    quizVersion: number;
    quizTitle: string;
    score: number;
  }[],
  StoreQueryError
> {
  return state
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
    .where({ "m.courseId": courseId, id: userId, "m.deletedAt": undefined })
    .select(["qr.questionnaireVersion", "qs.version", "qs.title", "qr.score"])
    .map((rows) => {
      return rows
        .filter((row) => row["qr.questionnaireVersion"] === row["qs.version"])
        .map((row) => ({
          responseVersion: row["qr.questionnaireVersion"],
          quizVersion: row["qs.version"],
          quizTitle: row["qs.title"],
          score: row["qr.score"],
        }));
    });
}
