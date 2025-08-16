import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { AddTextSectionToUnitUseCase } from "../../use-cases/course/module/unit/section/add-text-section-to-unit.js";
import { DeleteTextSectionUseCase } from "../../use-cases/course/module/unit/section/delete-text-section.js";
import type { TextSection } from "../sections/text-section.js";

export async function createTextSectionMock(
  services: MockedDependencies,
  userId: UUID,
  unitId: UUID,
  section: Partial<TextSection> = {},
): Promise<UUID> {
  // Create a text section in the unit
  const sectionResult = await AddTextSectionToUnitUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      unitId,
      text:
        section.content?.text ?? "This is a text section for testing purposes.",
    },
  ).runOrThrow();

  if (section.deletedAt) {
    await deleteTextSectionMock(services, userId, sectionResult.sectionId);
  }

  return sectionResult.sectionId;
}

export async function deleteTextSectionMock(
  services: MockedDependencies,
  userId: UUID,
  sectionId: UUID,
): Promise<void> {
  await DeleteTextSectionUseCase.call(
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
