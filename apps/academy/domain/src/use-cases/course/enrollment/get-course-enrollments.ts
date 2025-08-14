import type { UnexpectedError } from "@fabric/core";
import { Effect, Field, isLike, Schema, type Infer } from "@fabric/core";
import { EnrollmentModel } from "../../../models/enrollment.js";
import { getStudentProgressInCourse } from "../../../models/progress/get-student-progress-in-course.js";
import { getQuestionnairesCountFromCourse } from "../../../models/sections/get-all-questionnaires-from-course.js";
import {
  UserInviteViewModelProperties,
  type UserInviteViewModel,
} from "../../../models/user-invite.js";
import {
  UserViewModelProperties,
  type UserViewModel,
} from "../../../models/user.js";
import { AccessPolicy } from "../../../security/access-policy.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UseCase } from "../../../utils/use-case.js";

// Input model for the get course enrollments use case
export const GetCourseEnrollmentsInputModel = new Schema({
  courseId: Field.uuid(),
  filter: Field.string({ isOptional: true }),
});
export type GetCourseEnrollmentsInput = Infer<
  typeof GetCourseEnrollmentsInputModel
>;

export interface GetCourseEnrollmentsDependencies {
  state: DomainStateStore;
}

interface StudentViewModelWithProgress extends UserViewModel {
  quizzesTried: number; // Number of quizzes completed with or without full score
  quizzesCompleted: number; // Number of quizzes completed with full score
}

export interface GetCourseEnrollmentsOutput {
  students: StudentViewModelWithProgress[];
  invites: UserInviteViewModel[];
  totalQuizzes: number;
}

export const GetCourseEnrollmentsUseCase = new UseCase({
  name: "getCourseEnrollments",
  type: "query",
  auth: AccessPolicy.WithPermission("ENROLL_STUDENTS"),
  inputSchema: GetCourseEnrollmentsInputModel,
  effect: (
    { state }: GetCourseEnrollmentsDependencies,
    { courseId, filter }: GetCourseEnrollmentsInput,
  ): Effect<GetCourseEnrollmentsOutput, UnexpectedError> => {
    return Effect.fromGen(function* () {
      const questionnaireCount = yield* getQuestionnairesCountFromCourse(
        state,
        courseId,
      );

      const students = yield* state
        .from("users")
        .innerJoin({
          model: EnrollmentModel,
          as: "e",
          on: { left: "id", right: "userId" },
        })
        .where(
          filter
            ? [
                { "e.courseId": courseId, email: isLike(`%${filter}%`) },
                {
                  "e.courseId": courseId,
                  firstName: isLike(`%${filter}%`),
                },
                { "e.courseId": courseId, lastName: isLike(`%${filter}%`) },
              ]
            : undefined,
        )
        .select(UserViewModelProperties);

      const studentsWithProgress: StudentViewModelWithProgress[] = [];

      for (const student of students) {
        const quizzes = yield* getStudentProgressInCourse(
          state,
          courseId,
          student.id,
        );

        studentsWithProgress.push({
          ...student,
          quizzesTried: quizzes.length, // Count all quizzes done, regardless of score
          quizzesCompleted: quizzes.filter((quiz) => quiz.score === 100).length, // Count only quizzes with full score
        });
      }

      const userInvites = yield* state
        .from("userInvites")
        .innerJoin({
          model: EnrollmentModel,
          as: "e",
          on: { left: "id", right: "userId" },
        })
        .where(
          filter
            ? [{ "e.courseId": courseId, email: isLike(`%${filter}%`) }]
            : undefined,
        )
        .select(UserInviteViewModelProperties);

      const result: GetCourseEnrollmentsOutput = {
        students: studentsWithProgress,
        invites: userInvites,
        totalQuizzes: questionnaireCount,
      };
      return result;
    });
  },
});
