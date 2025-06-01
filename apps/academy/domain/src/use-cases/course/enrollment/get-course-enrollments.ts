import type { UnexpectedError } from "@fabric/core";
import { Effect, Field, isLike, Schema, type Infer } from "@fabric/core";
import { EnrollmentModel } from "../../../models/enrollment.js";
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

export interface GetCourseEnrollmentsOutput {
  users: UserViewModel[];
  userInvites: UserInviteViewModel[];
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
      // 2. Get users whose id is in userIds and apply filter if provided
      const users = yield* state
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

      // 3. Get userInvites whose id is in userIds and apply filter if provided
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

      // 4. Merge and tag type
      const result: GetCourseEnrollmentsOutput = {
        users,
        userInvites,
      };
      return result;
    });
  },
});
