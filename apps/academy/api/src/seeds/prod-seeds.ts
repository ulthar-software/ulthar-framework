import { UserCreatedEvent, UserRole } from "@ulthar/academy-domain";
import type { AppDependencies } from "../dependencies.js";

export const PROD_SEEDS = [
  async ({ events, env, crypto }: AppDependencies) => {
    const userId = crypto.randomUUID();
    const event = UserCreatedEvent.from({
      id: crypto.randomUUID(),
      streamId: userId,
      payload: {
        firstName: env.get("ADMIN_FIRST_NAME"),
        lastName: env.get("ADMIN_LAST_NAME"),
        email: env.get("ADMIN_EMAIL"),
        hashedPassword: await crypto
          .hashPassword(env.get("ADMIN_PASSWORD"))
          .runOrThrow(),
        role: UserRole.ADMIN,
      },
      version: 1,
    });

    await events.append("users", event).runOrThrow();
  },
];
