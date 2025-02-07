import { describe, expect, partialMock, test } from "@fabric/testing";
import { getSessionFromStorage } from "./auth.ts";

describe("getSessionFromStorage", () => {
  test("should return the session from local storage", async () => {
    const expected = { userId: "1", expiresAt: 1 };
    const storage = partialMock<Storage>({
      getItem: () => JSON.stringify(expected),
    });

    const result = await getSessionFromStorage().run({ localStorage: storage });

    const session = result.unwrapOrThrow();
    expect(session.value).toEqual(expected);
  });

  test("should return none if the session is not in local storage", async () => {
    const storage = partialMock<Storage>({
      getItem: () => null,
    });

    const result = await getSessionFromStorage().run({ localStorage: storage });

    const session = result.unwrapOrThrow();

    expect(session.isNothing()).toBe(true);
  });

  test("should return none if the session stored is invalid", async () => {
    const storage = partialMock<Storage>({
      getItem: () => "invalid",
    });

    const result = await getSessionFromStorage().run({ localStorage: storage });

    const session = result.unwrapOrThrow();

    expect(session.isNothing()).toBe(true);
  });
});
