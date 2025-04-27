import type { Effect, UUID } from "@fabric/core";
import type { Unit } from "../../../models/unit.js";
import type { DomainStateStore } from "../../../services/state-store.js";
import { UnitNotFoundError } from "../errors.js";

export function getUnitById(
  state: DomainStateStore,
  unitId: UUID,
): Effect<Unit, UnitNotFoundError> {
  // Get the unit by ID
  return state
    .from("units")
    .where({ id: unitId })
    .selectOneOrFail()
    .mapError(() => new UnitNotFoundError(unitId));
}
