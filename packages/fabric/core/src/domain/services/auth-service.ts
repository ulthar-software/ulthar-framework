export interface AuthService<TUser extends object> {
  generateAccessToken(user: TUser): string;
  generateRefreshToken(user: TUser): string;
}
