import type { UUID } from "../types/uuid.ts";

export interface UUIDGenerator {
  generate(): UUID;
}
