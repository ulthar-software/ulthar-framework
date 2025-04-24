import { describe, expect, it } from "@fabric/testing";
import { generatePath } from "./generate-path.ts";

describe("generatePath", () => {
  it("should generate the correct path", () => {
    const path = "./pages/index.tsx";
    const expectedPath = "/";

    const result = generatePath(path);

    expect(result).toBe(expectedPath);
  });

  it("should handle paths without .tsx or .ts extensions", () => {
    const path = "./pages/home.tsx";
    const expectedPath = "/home";

    const result = generatePath(path);

    expect(result).toBe(expectedPath);
  });

  it("should handle paths with multiple segments", () => {
    const path = "./pages/users/profile.tsx";
    const expectedPath = "/users/profile";

    const result = generatePath(path);

    expect(result).toBe(expectedPath);
  });

  it("should handle paths with index.tsx", () => {
    const path = "./pages/users/index.tsx";
    const expectedPath = "/users";

    const result = generatePath(path);

    expect(result).toBe(expectedPath);
  });

  it("should handle paths with index.tsx", () => {
    const path = "./pages/course/[id]/index.tsx";
    const expectedPath = "/course/:id";

    const result = generatePath(path);

    expect(result).toBe(expectedPath);
  });
});
