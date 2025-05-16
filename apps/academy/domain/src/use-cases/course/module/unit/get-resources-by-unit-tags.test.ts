import type { UUID } from "@fabric/core";
import { beforeEach, describe, expect, test } from "@fabric/testing";
import { createCourseMock } from "../../../../models/mocks/create-course-mock.js";
import { createEnrollmentMock } from "../../../../models/mocks/create-enrollment-mock.js";
import { createModuleMock } from "../../../../models/mocks/create-module-mock.js";
import { createUnitMock } from "../../../../models/mocks/create-unit-mock.js";
import { createUserMock } from "../../../../models/mocks/create-user-mock.js";
import { ResourceTagCreatedEvent } from "../../../../models/resource-tag.js";
import {
  ResourceCreatedEvent,
  ResourceType,
} from "../../../../models/resource.js";
import { TagCreatedEvent } from "../../../../models/tag.js";
import { UnitTagCreatedEvent } from "../../../../models/unit-tag.js";
import type { User } from "../../../../models/user.js";
import { Permission } from "../../../../security/permission.js";
import {
  createServiceMocks,
  type MockedDependencies,
} from "../../../../services/mocks/create-mock-services.js";
import { NotEnrolledInCourseError, UnitNotFoundError } from "../../errors.js";
import { GetResourcesByUnitTagsUseCase } from "./get-resources-by-unit-tags.js";

describe("Get Resources By Unit Tags Use Case", () => {
  let services: MockedDependencies;
  let user: User;
  let existingCourseId: UUID;
  let existingModuleId: UUID;
  let existingUnitId: UUID;
  let tagIds: UUID[] = [];
  let resourceIds: UUID[] = [];

  beforeEach(async () => {
    services = await createServiceMocks();

    // Create a test user
    user = await createUserMock(services);

    // Create a test course
    existingCourseId = await createCourseMock(services, user.id, {
      title: "Test Course",
      description: "A course for testing resources by unit tags",
    });

    // Create a module for the course
    existingModuleId = await createModuleMock(
      services,
      user.id,
      existingCourseId,
      {
        title: "Module 1",
        description: "First module",
      },
    );

    // Create a unit for the module
    existingUnitId = await createUnitMock(services, user.id, existingModuleId, {
      title: "Unit 1",
    });

    // Create tags
    tagIds = [];
    for (let i = 1; i <= 3; i++) {
      const tagId = services.crypto.randomUUID();
      const tagEventId = services.crypto.randomUUID();

      const tagEvent = TagCreatedEvent.from({
        id: tagEventId,
        streamId: tagId,
        payload: {
          name: `Tag ${i}`,
          createdBy: user.id,
        },
        version: 1,
      });

      await services.events.append("tags", tagEvent).runOrThrow();
      tagIds.push(tagId);
    }

    // Create resources
    resourceIds = [];
    for (let i = 1; i <= 4; i++) {
      const resourceId = services.crypto.randomUUID();
      const resourceEventId = services.crypto.randomUUID();

      const resourceEvent = ResourceCreatedEvent.from({
        id: resourceEventId,
        streamId: resourceId,
        payload: {
          courseId: existingCourseId,
          title: `Resource ${i}`,
          description: `Description for resource ${i}`,
          url: `https://example.com/resource-${i}`,
          type: ResourceType.RECOMMENDED_READING,
          createdBy: user.id,
        },
        version: 1,
      });

      await services.events.append("resources", resourceEvent).runOrThrow();
      resourceIds.push(resourceId);
    }

    // Associate tags with resources (not all resources will have tags)
    // Resource 1 -> Tag 1, Tag 2
    // Resource 2 -> Tag 2
    // Resource 3 -> Tag 3
    // Resource 4 -> No tags

    const resourceTagAssociations = [
      { resourceId: resourceIds[0], tagId: tagIds[0] }, // Resource 1 - Tag 1
      { resourceId: resourceIds[0], tagId: tagIds[1] }, // Resource 1 - Tag 2
      { resourceId: resourceIds[1], tagId: tagIds[1] }, // Resource 2 - Tag 2
      { resourceId: resourceIds[2], tagId: tagIds[2] }, // Resource 3 - Tag 3
    ];

    for (const assoc of resourceTagAssociations) {
      const rtId = services.crypto.randomUUID();
      const rtEventId = services.crypto.randomUUID();

      const rtEvent = ResourceTagCreatedEvent.from({
        id: rtEventId,
        streamId: rtId,
        payload: {
          resourceId: assoc.resourceId,
          tagId: assoc.tagId,
          createdBy: user.id,
        },
        version: 1,
      });

      await services.events.append("resourceTags", rtEvent).runOrThrow();
    }
  });

  test("Should get resources related to a unit's tags", async () => {
    // Associate tags 1 and 2 with the unit
    const unitTagAssociations = [
      { unitId: existingUnitId, tagId: tagIds[0] }, // Unit - Tag 1
      { unitId: existingUnitId, tagId: tagIds[1] }, // Unit - Tag 2
    ];

    for (const assoc of unitTagAssociations) {
      const utId = services.crypto.randomUUID();
      const utEventId = services.crypto.randomUUID();

      const utEvent = UnitTagCreatedEvent.from({
        id: utEventId,
        streamId: utId,
        payload: {
          unitId: assoc.unitId,
          tagId: assoc.tagId,
          createdBy: user.id,
        },
        version: 1,
      });

      await services.events.append("unitTags", utEvent).runOrThrow();
    }

    // Arrange
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // We should get resources 1 and 2 as they have tags 1 and 2
    expect(result.resources.length).toBe(2);

    // Verify resources
    const resourceTitles = result.resources.map((r) => r.title).sort();
    expect(resourceTitles).toEqual(["Resource 1", "Resource 2"].sort());
  });

  test("Should return empty resources array when unit has no tags", async () => {
    // Arrange - Don't associate any tags with the unit
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.resources).toHaveLength(0);
  });

  test("Should return empty resources array when unit has tags but no matching resources", async () => {
    // Create a new tag that no resource has
    const newTagId = services.crypto.randomUUID();
    const newTagEventId = services.crypto.randomUUID();

    const tagEvent = TagCreatedEvent.from({
      id: newTagEventId,
      streamId: newTagId,
      payload: {
        name: "Unique Tag",
        createdBy: user.id,
      },
      version: 1,
    });

    await services.events.append("tags", tagEvent).runOrThrow();

    // Associate only the new tag with the unit
    const utId = services.crypto.randomUUID();
    const utEventId = services.crypto.randomUUID();

    const utEvent = UnitTagCreatedEvent.from({
      id: utEventId,
      streamId: utId,
      payload: {
        unitId: existingUnitId,
        tagId: newTagId,
        createdBy: user.id,
      },
      version: 1,
    });

    await services.events.append("unitTags", utEvent).runOrThrow();

    // Arrange
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Assert
    expect(result.resources).toHaveLength(0);
  });

  test("Admin should successfully get resources by unit tags", async () => {
    // Associate tag 3 with the unit
    const utId = services.crypto.randomUUID();
    const utEventId = services.crypto.randomUUID();

    const utEvent = UnitTagCreatedEvent.from({
      id: utEventId,
      streamId: utId,
      payload: {
        unitId: existingUnitId,
        tagId: tagIds[2], // Tag 3
        createdBy: user.id,
      },
      version: 1,
    });

    await services.events.append("unitTags", utEvent).runOrThrow();

    // Arrange
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).runOrThrow();

    // Should get resource 3 which has tag 3
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].title).toBe("Resource 3");
  });

  test("Enrolled student should successfully get resources by unit tags", async () => {
    // Arrange - Enroll the student in the course
    await createEnrollmentMock(services, user.id, existingCourseId);

    // Associate tag 1 with the unit
    const utId = services.crypto.randomUUID();
    const utEventId = services.crypto.randomUUID();

    const utEvent = UnitTagCreatedEvent.from({
      id: utEventId,
      streamId: utId,
      payload: {
        unitId: existingUnitId,
        tagId: tagIds[0], // Tag 1
        createdBy: user.id,
      },
      version: 1,
    });

    await services.events.append("unitTags", utEvent).runOrThrow();

    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No special permissions
        },
      },
      queryData,
    ).runOrThrow();

    // Should get resource 1 which has tag 1
    expect(result.resources).toHaveLength(1);
    expect(result.resources[0].title).toBe("Resource 1");
  });

  test("Non-enrolled student should not be able to see resources", async () => {
    // Associate a tag with the unit
    const utId = services.crypto.randomUUID();
    const utEventId = services.crypto.randomUUID();

    const utEvent = UnitTagCreatedEvent.from({
      id: utEventId,
      streamId: utId,
      payload: {
        unitId: existingUnitId,
        tagId: tagIds[0],
        createdBy: user.id,
      },
      version: 1,
    });

    await services.events.append("unitTags", utEvent).runOrThrow();

    // Arrange
    const queryData = {
      courseId: existingCourseId,
      unitId: existingUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [], // No special permissions
        },
      },
      queryData,
    ).run();

    // Assert
    expect(result.isError()).toBe(true);
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(NotEnrolledInCourseError);
    expect((error as NotEnrolledInCourseError).userId).toBe(user.id);
    expect((error as NotEnrolledInCourseError).courseId).toBe(existingCourseId);
  });

  test("Should fail when unit doesn't exist", async () => {
    // Arrange
    const nonExistentUnitId = "00000000-0000-0000-0000-000000000000";
    const queryData = {
      courseId: existingCourseId,
      unitId: nonExistentUnitId,
    };

    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      queryData,
    ).run();

    // Assert
    const error = result.unwrapErrorOrThrow();
    expect(error).toBeInstanceOf(UnitNotFoundError);
    expect((error as UnitNotFoundError).unitId).toBe(nonExistentUnitId);
  });

  test("Should return all resources for the course when getFullCourse is true", async () => {
    // Act
    const result = await GetResourcesByUnitTagsUseCase.call(
      {
        ...services,
        currentUser: {
          id: user.id,
          permissions: [Permission.VIEW_COURSE],
        },
      },
      {
        courseId: existingCourseId,
        unitId: existingUnitId,
        getFullCourse: true,
      },
    ).runOrThrow();

    // Assert: All 4 resources for the course should be returned
    expect(result.resources).toHaveLength(4);
    const resourceTitles = result.resources.map((r) => r.title).sort();
    expect(resourceTitles).toEqual(
      ["Resource 1", "Resource 2", "Resource 3", "Resource 4"].sort(),
    );
  });
});
