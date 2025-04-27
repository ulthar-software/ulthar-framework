import type { AuthService, Logger } from "@ulthar/academy-domain";

export interface AuthDependencies {
  auth: AuthService;
  logger: Logger;
}

export async function parseAccessToken(
  { auth, logger }: AuthDependencies,
  token: string | undefined,
) {
  if (token) {
    try {
      const result = await auth.validateAccessToken(token).runOrThrow();
      return result;
    } catch {
      logger.error(`Tried parsing invalid token: ${token}`);
    }
  }
  return undefined;
}
