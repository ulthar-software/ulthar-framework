import type { UUID } from "@fabric/core";
import {
  beforeEach,
  describe,
  expect,
  partialMock,
  test,
} from "@fabric/testing";
import {
  getPermissionsForRole,
  InvalidTokenError,
  type User,
} from "@ulthar/academy-domain";
import { ConcreteAuthService } from "./auth-service.js";

describe("ConcreteAuthService", () => {
  const jwtSecret = "test-secret-key";
  let authService: ConcreteAuthService;
  let mockUser: User;

  beforeEach(() => {
    // Create a new auth service instance
    authService = new ConcreteAuthService(jwtSecret);

    // Create mock user object
    mockUser = partialMock<User>({
      id: "user-123" as UUID,
      role: "ADMIN",
    });
  });

  describe("generateAccessToken", () => {
    test("should generate a valid JWT token", async () => {
      // Act
      const result = await authService
        .generateAccessToken(mockUser)
        .runOrThrow();

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result.split(".").length).toBe(3); // JWT token has 3 parts
    });

    test("should generate token with correct user information", async () => {
      // Act
      const token = await authService
        .generateAccessToken(mockUser)
        .runOrThrow();

      // Validate the token and check its contents
      const validationResult = await authService
        .validateAccessToken(token)
        .runOrThrow();

      // Assert
      expect(validationResult.id).toBe(mockUser.id);
      expect(Array.isArray(validationResult.permissions)).toBe(true);
      // Student should have at least these basic permissions
      expect(validationResult.permissions).toEqual(
        getPermissionsForRole("ADMIN"),
      );
    });
  });

  describe("validateAccessToken", () => {
    test("should validate a valid token and return user access", async () => {
      // Arrange - Create a real token first
      const token = await authService
        .generateAccessToken(mockUser)
        .runOrThrow();

      // Act
      const result = await authService.validateAccessToken(token).runOrThrow();

      // Assert
      expect(result).toBeDefined();
      expect(result.id).toBe(mockUser.id);
      expect(Array.isArray(result.permissions)).toBe(true);
    });

    test("should return InvalidTokenError when token is malformed", async () => {
      // Arrange
      const invalidToken = "invalid.token.format";

      // Act
      const result = await authService.validateAccessToken(invalidToken).run();

      // Assert
      expect(result.isError()).toBe(true);
      const error = result.unwrapErrorOrThrow();
      expect(error).toBeInstanceOf(InvalidTokenError);
    });

    test("should return InvalidTokenError when token is tampered", async () => {
      // Arrange
      const token = await authService
        .generateAccessToken(mockUser)
        .runOrThrow();
      const tamperedToken = token.substring(0, token.length - 5) + "12345";

      // Act
      const result = await authService.validateAccessToken(tamperedToken).run();

      // Assert
      expect(result.isError()).toBe(true);
      const error = result.unwrapErrorOrThrow();
      expect(error).toBeInstanceOf(InvalidTokenError);
    });

    test("should return InvalidTokenError when token is from different secret", async () => {
      // Arrange
      const token = await authService
        .generateAccessToken(mockUser)
        .runOrThrow();
      const differentAuthService = new ConcreteAuthService("different-secret");

      // Act
      const result = await differentAuthService
        .validateAccessToken(token)
        .run();

      // Assert
      expect(result.isError()).toBe(true);
      const error = result.unwrapErrorOrThrow();
      expect(error).toBeInstanceOf(InvalidTokenError);
    });

    // Note: We can't easily test the ExpiredTokenError case without mocking
    // or introducing a very long delay, so we'll skip that test
  });
});
