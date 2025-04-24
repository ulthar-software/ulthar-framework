import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { AddTextSectionToUnitUseCase } from "../../use-cases/course/module/unit/section/add-text-section-to-unit.js";
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
      title: section.title ?? "Test Text Section",
      text:
        section.content?.text ?? "This is a text section for testing purposes.",
    },
  ).runOrThrow();

  return sectionResult.sectionId;
}
