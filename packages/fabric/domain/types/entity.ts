import type { UUID } from "./uuid.ts";

/**
 * An entity is a domain object that is defined by its identity.
 *
 * Entities have a unique identity (`id`), which distinguishes
 * them from other entities.
 */
export interface Entity {
  id: UUID;
}
