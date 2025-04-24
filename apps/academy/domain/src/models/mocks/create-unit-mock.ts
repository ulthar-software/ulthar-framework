import type { UUID } from "@fabric/core";
import { Permission } from "../../security/permission.js";
import type { MockedDependencies } from "../../services/mocks/create-mock-services.js";
import { AddUnitToModuleUseCase } from "../../use-cases/index.js";
import type { Unit } from "../unit.js";

export async function createUnitMock(
  services: MockedDependencies,
  userId: UUID,
  moduleId: UUID,
  unit: Partial<Unit> = {},
): Promise<UUID> {
  // Create a unit in the module
  const unitResult = await AddUnitToModuleUseCase.call(
    {
      ...services,
      currentUser: {
        id: userId,
        permissions: [Permission.EDIT_COURSE],
      },
    },
    {
      moduleId,
      title: unit.title ?? "Test Unit",
    },
  ).runOrThrow();

  return unitResult.unitId;
}
