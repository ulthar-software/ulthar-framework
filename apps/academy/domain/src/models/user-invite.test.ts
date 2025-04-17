// filepath: c:\Users\piarrot\Development\ultharsoftware\ulthar-framework\apps\academy\domain\src\models\user-invite.test.ts
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { UserRole } from "../security/user-role.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../services/mocks/create-mock-services.js";
import {
  UserInviteAcceptedEvent,
  UserInviteProjector,
  UserInvitedEvent,
} from "./user-invite.js";

describe("UserInvite", () => {
  let services: MockedDependencies;

  beforeEach(async () => {
    services = await createServiceMocks();
  });

  test("Creating a user invite", () => {
    const inviteId = services.crypto.randomUUID();
    const event = UserInvitedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: inviteId,
      payload: {
        email: "test@example.com",
        role: UserRole.STUDENT,
        code: "invite-code-123",
      },
      version: 1n,
    });

    const userInvite = UserInviteProjector.project(event).unwrapOrThrow();

    expect(userInvite).toEqual({
      id: inviteId,
      email: "test@example.com",
      role: UserRole.STUDENT,
      code: "invite-code-123",
      version: 1n,
      updatedAt: event.timestamp,
      createdAt: event.timestamp,
    });
  });

  test("Accepting a user invite", () => {
    // First create an invite
    const inviteId = services.crypto.randomUUID();
    const inviteEvent = UserInvitedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: inviteId,
      payload: {
        email: "invited@example.com",
        role: UserRole.TEACHER,
        code: "invite-code-456",
      },
      version: 1n,
    });

    const userInvite = UserInviteProjector.project(inviteEvent).unwrapOrThrow();

    if (!userInvite) throw new Error("User invite was not created");

    // Then accept the invite
    const acceptEvent = UserInviteAcceptedEvent.from({
      id: services.crypto.randomUUID(),
      streamId: inviteId,
      payload: {},
      version: 2n,
    });

    const result = UserInviteProjector.project(
      acceptEvent,
      userInvite,
    ).unwrapOrThrow();

    // The projector should make the invite no longer available when accepted
    expect(result).toBeNull();
  });
});
