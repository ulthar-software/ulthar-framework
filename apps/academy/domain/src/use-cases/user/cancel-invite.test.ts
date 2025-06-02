import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createServiceMocks, type MockedDependencies } from "../../mocks.js";
import { createCourseMock } from "../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../models/mocks/create-enrollment-mock.js";
import { createInvitationMock } from "../../models/mocks/create-invitation-mock.js";
import { createUserMock } from "../../models/mocks/create-user-mock.js";
import type { User } from "../../models/user.js";
import { Permission } from "../../security/permission.js";
import { UserRole } from "../../security/user-role.js";
import { mockUserAccess } from "../../utils/mock-user-access.js";
import { CancelInviteUseCase } from "./cancel-invite.js";

describe("Cancel Invite Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let courseId: UUID;

  beforeEach(async () => {
    services = await createServiceMocks();
    user = await createUserMock(services);
    courseId = await createCourseMock(services, user.id);
  });

  test("Should successfully cancel an existing user invite", async () => {
    const inviteId = await createInvitationMock(services, {
      email: "test@example.com",
      role: UserRole.STUDENT,
    });

    await createEnrollmentMock(services, inviteId, courseId);

    await CancelInviteUseCase.call(
      {
        ...services,
        currentUser: mockUserAccess(
          services,
          [Permission.INVITE_USERS],
          user.id,
        ),
      },
      {
        inviteId,
      },
    ).runOrThrow();

    const oldInvite = await services.state
      .from("userInvites")
      .where({ id: inviteId })
      .selectOne()
      .runOrThrow();
    expect(oldInvite.isNothing()).toBe(true);

    const invites = await services.state
      .from("userInvites")
      .select()
      .runOrThrow();
    expect(invites.length).toBe(0);

    const enrollments = await services.state
      .from("enrollments")
      .select()
      .runOrThrow();
    expect(enrollments.length).toBe(0);
  });
});
