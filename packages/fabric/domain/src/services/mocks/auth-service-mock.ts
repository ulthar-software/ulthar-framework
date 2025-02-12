import type { UUID } from "@fabric/core";
import type { AuthService } from "../auth-service.js";

export class AuthServiceMock<TUser extends { id: UUID }>
  implements AuthService<TUser>
{
  generateAccessToken(user: TUser): string {
    return `access-token-${user.id}`;
  }
  generateRefreshToken(user: TUser): string {
    return `refresh-token-${user.id}`;
  }
}
