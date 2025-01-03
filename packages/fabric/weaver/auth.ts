import { Effect, Option, PosixDate, TaggedError, UUID } from "@fabric/core";

export interface GetSessionFromStorageDeps {
  localStorage: Storage;
}

const SESSION_KEY = "session";

export function getSessionFromStorage() {
  return Effect.tryFrom(
    ({ localStorage }: GetSessionFromStorageDeps) => {
      const session = localStorage.getItem(SESSION_KEY);
      return Option.from<Session>(session ? JSON.parse(session) : null);
    },
    (e) => new SessionStorageError(e.message),
  )
    .tapError(() => console.log("error"))
    .catchAll(() => Option.none());
}

export class SessionStorageError extends TaggedError<"SessionStorageError"> {
  constructor(message: string) {
    super("SessionStorageError", message);
  }
}

export interface Session {
  sessionId: UUID;
  userId: UUID;
  expiresAt: PosixDate;
}
