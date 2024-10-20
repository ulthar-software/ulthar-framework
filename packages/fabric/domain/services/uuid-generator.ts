import type { UUID } from "../../core/types/uuid.ts";

export interface UUIDGenerator {
  generate(): UUID;
}
