import type { UUID } from "@fabric/core";
import { faker } from "@fabric/testing";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { CreateTagUseCase } from "../../use-cases/tag/create-tag.js";
import type { Tag } from "../tag.js";

/**
 * Creates a mock tag for testing purposes
 *
 * @param services Mocked service dependencies
 * @param userId User ID of the user creating the tag
 * @param tag Partial tag data (optional)
 * @returns The ID of the created tag
 */
export async function createTagMock(
  services: MockedDependencies,
  userId: UUID,
  tag: Partial<Tag> = {},
): Promise<UUID> {
  // Create a tag using the CreateTagUseCase
  const tagResult = await CreateTagUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.MANAGE_TAGS],
      },
    },
    {
      name: tag.name ?? faker.word.words({ count: { min: 1, max: 3 } }),
    },
  ).runOrThrow();

  return tagResult.tagId;
}
