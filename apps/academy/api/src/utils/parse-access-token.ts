import type { AuthService } from "@ulthar/academy-domain";

export interface AuthDependencies {
  auth: AuthService;
}

export async function parseAccessToken(
  { auth }: AuthDependencies,
  token: string | undefined,
) {
  if (token) {
    return await auth.validateAccessToken(token).run();
  }
}
