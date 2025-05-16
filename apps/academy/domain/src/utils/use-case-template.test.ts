import type { UUID } from "@fabric/core";
import { beforeAll, describe, expect, test } from "@fabric/testing";
import { createServiceMocks, type MockedDependencies } from "../mocks.js";
import { createCourseMock } from "../models/mocks/create-course-mock.js";
import { createUserMock } from "../models/mocks/create-user-mock.js";
import type { User } from "../models/user.js";

describe("Template Use Case", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let courseId: UUID;
  let services: MockedDependencies;
  let admin: User;

  beforeAll(async () => {
    services = await createServiceMocks();
    admin = await createUserMock(services, { role: "ADMIN" });
    courseId = await createCourseMock(services, admin.id);
  });

  test("Template test", () => {
    expect(true).toBe(true);
  });
});
