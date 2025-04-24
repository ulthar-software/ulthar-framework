import { type Email, type UUID } from "@fabric/core";
import { faker } from "@fabric/testing";
import {
  UserRegisteredByInvitationEvent,
  type User,
} from "../../models/user.js";
import { UserRole } from "../../security/user-role.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";

interface UserMockOptions {
  id?: UUID;
  firstName?: string;
  lastName?: string;
  email?: Email;
  password?: string;
  role?: UserRole;
}

export async function createUserMock(
  { events, state, crypto }: MockedDependencies,
  opts: UserMockOptions = {},
): Promise<User> {
  const userId = opts.id ?? crypto.randomUUID();
  const firstName = opts.firstName ?? faker.person.firstName();
  const lastName = opts.lastName ?? faker.person.lastName();
  const email = opts.email ?? faker.internet.email({ firstName, lastName });
  const password = opts.password ?? faker.internet.password();

  await events
    .append(
      "users",
      UserRegisteredByInvitationEvent.from({
        id: crypto.randomUUID(),
        streamId: userId,
        payload: {
          firstName,
          lastName,
          email: email as Email,
          hashedPassword: await crypto.hashPassword(password).runOrThrow(),
          role: opts.role ?? UserRole.ADMIN,
          invitedBy: crypto.randomUUID(),
        },
        version: 1,
      }),
    )
    .runOrThrow();

  return await state
    .from("users")
    .where({ id: userId })
    .selectOneOrFail()
    .runOrThrow();
}
