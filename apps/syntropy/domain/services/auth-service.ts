import type { User } from "../models/user.ts";

export interface AuthService {
  generateAccessToken(user: User): string;
  generateRefreshToken(user: User): string;
}
