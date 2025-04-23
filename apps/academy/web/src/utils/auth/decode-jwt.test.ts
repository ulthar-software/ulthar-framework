import { describe, expect, it } from "@fabric/testing";
import { decodeJWT, JWTDecodeError } from "./decode-jwt.js";

describe("decodeJWT", () => {
  it("should successfully decode a valid JWT token", () => {
    // Valid JWT with payload { "sub": "1234567890", "name": "John Doe", "iat": 1516239022 }
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ.SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const result = decodeJWT<{ sub: string; name: string; iat: number }>(token);

    expect(result.isOk()).toBe(true);
    const payload = result.unwrapOrThrow();
    expect(payload).toEqual({
      sub: "1234567890",
      name: "John Doe",
      iat: 1516239022,
    });
  });

  it("should return an error for JWT with malformed payload", () => {
    // JWT with invalid JSON in payload part (invalid JSON after base64 decoding)
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOiIxMjM0NTY3ODkw.invalidSignature";

    const result = decodeJWT<Record<string, unknown>>(token);

    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(JWTDecodeError);
    expect(error.message).toBe("Malformed Payload");
  });

  it("should return an error for JWT with invalid base64 encoding", () => {
    // JWT with invalid base64 in payload part
    const token =
      "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.!@#$%^&*().SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c";

    const result = decodeJWT<Record<string, unknown>>(token);

    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(JWTDecodeError);
    expect(error.message).toBe("Malformed base64 string");
  });

  it("should return an error for invalid JWT format (missing parts)", () => {
    // JWT with missing parts
    const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9";

    const result = decodeJWT<Record<string, unknown>>(token);

    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(JWTDecodeError);
    expect(error.message).toBe("Malformed base64 string");
  });
});
