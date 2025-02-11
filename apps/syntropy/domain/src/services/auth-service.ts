import type { User } from "../models/user.js";

export interface AuthService {
  generateAccessToken(user: User): string;
  generateRefreshToken(user: User): string;
}
