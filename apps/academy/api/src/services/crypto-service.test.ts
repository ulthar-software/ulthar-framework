import { InvalidPasswordError } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { ConcreteCryptoService } from "./crypto-service.js";

describe("ConcreteCryptoService", () => {
  let cryptoService: ConcreteCryptoService;

  beforeEach(() => {
    cryptoService = new ConcreteCryptoService();
  });

  describe("generateInviteCode", () => {
    test("should generate an 8-character hex code", () => {
      // Act
      const code = cryptoService.generateInviteCode();

      // Assert
      expect(code).toBeDefined();
      expect(typeof code).toBe("string");
      expect(code.length).toBe(8);
      // Check if it's a valid hex string
      expect(/^[0-9a-f]+$/.test(code)).toBe(true);
    });

    test("should generate different codes on multiple calls", () => {
      // Act
      const code1 = cryptoService.generateInviteCode();
      const code2 = cryptoService.generateInviteCode();

      // Assert
      expect(code1).not.toBe(code2);
    });
  });

  describe("hashPassword", () => {
    test("should hash a password successfully", async () => {
      // Arrange
      const password = "securepassword123";

      // Act
      const result = await cryptoService.hashPassword(password).runOrThrow();

      // Assert
      expect(result).toBeDefined();
      expect(typeof result).toBe("string");
      expect(result).not.toBe(password);
      // BCrypt hashes start with $2b$
      expect(result.startsWith("$2")).toBe(true);
    });

    test("should generate different hashes for the same password", async () => {
      // Arrange
      const password = "securepassword123";

      // Act
      const hash1 = await cryptoService.hashPassword(password).runOrThrow();
      const hash2 = await cryptoService.hashPassword(password).runOrThrow();

      // Assert
      expect(hash1).not.toBe(hash2);
    });
  });

  describe("verifyPassword", () => {
    test("should verify a correct password against its hash", async () => {
      // Arrange
      const password = "securepassword123";
      const hash = await cryptoService.hashPassword(password).runOrThrow();

      // Act
      const result = await cryptoService.verifyPassword(password, hash).run();

      // Assert
      expect(result.isOk()).toBe(true);
    });

    test("should return InvalidPasswordError for incorrect password", async () => {
      // Arrange
      const password = "securepassword123";
      const wrongPassword = "wrongpassword123";
      const hash = await cryptoService.hashPassword(password).runOrThrow();

      // Act
      const result = await cryptoService
        .verifyPassword(wrongPassword, hash)
        .run();

      // Assert
      expect(result.isError()).toBe(true);
      const error = result.unwrapErrorOrThrow();
      expect(error).toBeInstanceOf(InvalidPasswordError);
    });
  });

  describe("randomUUID", () => {
    test("should generate a valid UUID", () => {
      // Act
      const uuid = cryptoService.randomUUID();

      // Assert
      expect(uuid).toBeDefined();
      expect(typeof uuid).toBe("string");
      // UUID v4 format regexp
      const uuidRegex =
        /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
      expect(uuidRegex.test(uuid)).toBe(true);
    });

    test("should generate different UUIDs on multiple calls", () => {
      // Act
      const uuid1 = cryptoService.randomUUID();
      const uuid2 = cryptoService.randomUUID();

      // Assert
      expect(uuid1).not.toBe(uuid2);
    });
  });
});
