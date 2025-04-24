import { type Email, type UUID } from "@fabric/core";
import { faker } from "@fabric/testing";
import {
  UserRegisteredEvent,
  UserRoleChangedEvent,
  type User,
} from "../../models/user.js";
import type { UserType } from "../../security/users.js";
import type { MockedDependencies } from "./create-mock-services.js";

interface UserMockOptions {
  id?: UUID;
  firstName?: string;
  lastName?: string;
  email?: Email;
  password?: string;
  role?: UserType;
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
      UserRegisteredEvent.from({
        id: crypto.randomUUID(),
        streamId: userId,
        payload: {
          firstName,
          lastName,
          email: email as Email,
          hashedPassword: await crypto
            .hashPassword(opts.password ?? password)
            .runOrThrow(),
        },
        version: 1,
      }),
    )
    .runOrThrow();

  if (opts.role) {
    await events
      .append(
        "users",
        UserRoleChangedEvent.from({
          id: crypto.randomUUID(),
          streamId: userId,
          payload: {
            role: opts.role,
            changedBy: userId,
          },
          version: 2,
        }),
      )
      .runOrThrow();
  }

  return await state
    .from("users")
    .where({ id: userId })
    .selectOneOrFail()
    .runOrThrow();
}
