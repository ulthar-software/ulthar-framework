```ts
import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";

describe("Template Use Case", () => {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let courseId: UUID;
  let services: MockedDependencies;
  let admin: User;

  beforeEach(async () => {
    services = await createServiceMocks();
    admin = await createUserMock(services, { role: "ADMIN" });
    courseId = await createCourseMock(services, admin.id);
  });

  test("Template test", () => {
    expect(true).toBe(true);
  });
});
```
