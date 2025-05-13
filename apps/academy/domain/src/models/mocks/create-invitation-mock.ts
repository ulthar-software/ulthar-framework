import type { Email } from "@fabric/core";
import type { MockedDependencies } from "../../mocks.js";
import type { UserRole } from "../../security/user-role.js";
import { UserInvitedEvent } from "../user-invite.js";

// Helper to create invitation mocks
export async function createInvitationMock(
  { events, crypto }: MockedDependencies,
  opts: { email: Email; role: UserRole },
): Promise<void> {
  const inviteId = crypto.randomUUID();
  const inviteCode = crypto.generateInviteCode();

  const inviteEvent = UserInvitedEvent.from({
    id: crypto.randomUUID(),
    streamId: inviteId,
    version: 1,
    payload: {
      email: opts.email,
      role: opts.role,
      code: inviteCode,
    },
  });

  await events.append("userInvites", inviteEvent).runOrThrow();
}
