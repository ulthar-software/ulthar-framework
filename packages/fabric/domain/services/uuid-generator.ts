import type { UUID } from "@fabric/core";

export interface UUIDGenerator {
  generate(): UUID;
}
