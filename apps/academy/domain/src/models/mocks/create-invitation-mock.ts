import type { Email, UUID } from "@fabric/core";
import { faker } from "@fabric/testing";
import type { MockedDependencies } from "../../mocks.js";
import { UserRole } from "../../security/user-role.js";
import { UserInvitedEvent } from "../user-invite.js";

// Helper to create invitation mocks
export async function createInvitationMock(
  { events, crypto }: MockedDependencies,
  opts?: { email: Email; role: UserRole },
): Promise<UUID> {
  const inviteId = crypto.randomUUID();
  const inviteCode = crypto.generateInviteCode();

  const inviteEvent = UserInvitedEvent.from({
    id: crypto.randomUUID(),
    streamId: inviteId,
    version: 1,
    payload: {
      email: opts?.email ?? (faker.internet.email() as Email),
      role: opts?.role ?? faker.helpers.arrayElement(Object.values(UserRole)),
      code: inviteCode,
    },
  });

  await events.append("userInvites", inviteEvent).runOrThrow();
  return inviteId;
}
