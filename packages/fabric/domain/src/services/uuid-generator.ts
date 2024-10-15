import { UUID } from "../types/uuid.js";

export interface UUIDGenerator {
  generate(): UUID;
}
