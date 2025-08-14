import type { Infer, UnexpectedError } from "@fabric/core";
import { Effect, Field, Schema } from "@fabric/core";
import { QuestionnaireSectionModel } from "../../../models/index.js";
import { ModuleModel } from "../../../models/module.js";
import { UnitModel } from "../../../models/unit.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import type { UserAccess } from "../../../services/auth-service.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";
import { ModuleNotFoundError, NotEnrolledInCourseError } from "../errors.js";

export interface GetDetailedStudentProgressDependencies {
  state: DomainStateStore;
  currentUser: UserAccess;
}

export const GetDetailedStudentProgressInputModel = new Schema({
  moduleId: Field.uuid(),
  studentId: Field.uuid(),
});
export type GetDetailedStudentProgressInput = Infer<
  typeof GetDetailedStudentProgressInputModel
>;

export interface GetDetailedStudentProgressOutput {
  progress: number;
  quizzes: QuizProgress[];
}

export interface QuizProgress {
  quizId: string;
  quizTitle: string;
  attempts: number;
  score?: number;
  isCurrentVersion?: boolean;
}

export const GetDetailedStudentProgressUseCase = new UseCase({
  auth: AccessPolicy.WithPermission("LIST_USERS"),
  name: "getDetailedStudentProgress",
  type: "command",
  inputSchema: GetDetailedStudentProgressInputModel,
  effect: (
    { state }: GetDetailedStudentProgressDependencies,

    { moduleId, studentId }: GetDetailedStudentProgressInput,
  ): Effect<
    GetDetailedStudentProgressOutput,
    UnexpectedError | ModuleNotFoundError
  > => {
    return Effect.fromGen(function* () {
      // Check if the course exists
      const courseId = yield* state
        .from("modules")
        .where({ id: moduleId, deletedAt: undefined })
        .selectOneOrFail(["courseId"])
        .map((row) => row.courseId)
        .mapError(() => new ModuleNotFoundError(moduleId));

      yield* state
        .from("enrollments")
        .where({ courseId, userId: studentId })
        .selectOneOrFail(["id"])
        .mapError(() => new NotEnrolledInCourseError(studentId, courseId));

      // Get the total number of quizzes in the module
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
        .where({ "m.id": moduleId })
        .orderBy({
          "u.order": "ASC",
          order: "ASC",
        })
        .select(["id", "title"]);

      const moduleQuizCount = moduleQuizzes.length;

      // Get the number of quizzes the student has completed
      const studentQuizResponses = yield* state
        .from("questionnaireResponses")
        .innerJoin({
          model: QuestionnaireSectionModel,
          as: "qs",
          on: { left: "questionnaireId", right: "id" },
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
        .where({ "m.id": moduleId, userId: studentId })
        .select([
          "score",
          "version",
          "questionnaireVersion",
          "questionnaireId",
          "qs.version",
        ]);

      const studentQuizCount = studentQuizResponses.filter(
        (qr) =>
          qr.questionnaireVersion === qr["qs.version"] && qr.score === 100,
      ).length;

      return {
        progress: Math.round((studentQuizCount / moduleQuizCount) * 100),
        quizzes: moduleQuizzes.map((qs) => {
          const qResponse = studentQuizResponses.find(
            (qr) => qr.questionnaireId === qs.id,
          );
          return {
            quizId: qs.id,
            quizTitle: qs.title,
            attempts: qResponse?.version ?? 0,
            score: qResponse?.score,
            isCurrentVersion: qResponse
              ? qResponse["qs.version"] === qResponse.questionnaireVersion
              : false,
          };
        }),
      };
    });
  },
});
