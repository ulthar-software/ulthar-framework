import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { AddVideoSectionToUnitUseCase } from "../../use-cases/course/module/unit/section/add-video-section-to-unit.js";
import { DeleteVideoSectionUseCase } from "../../use-cases/course/module/unit/section/delete-video-section.js";
import type { VideoSection } from "../sections/video-section.js";

export async function createVideoSectionMock(
  services: MockedDependencies,
  userId: UUID,
  unitId: UUID,
  section: Partial<VideoSection> = {},
): Promise<UUID> {
  // Create a video section in the unit
  const sectionResult = await AddVideoSectionToUnitUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      unitId,
      title: section.title ?? "Test Video Section",
      videoUrl:
        section.content?.videoUrl ?? "https://example.com/test-video.mp4",
    },
  ).runOrThrow();

  if (section.deletedAt) {
    await deleteVideoSectionMock(services, userId, sectionResult.sectionId);
  }

  return sectionResult.sectionId;
}

export async function deleteVideoSectionMock(
  services: MockedDependencies,
  userId: UUID,
  sectionId: UUID,
): Promise<void> {
  await DeleteVideoSectionUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      sectionId,
    },
  ).runOrThrow();
}
