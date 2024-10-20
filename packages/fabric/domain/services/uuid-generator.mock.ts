import type { UUID } from "../../core/types/uuid.ts";
import type { UUIDGenerator } from "./uuid-generator.ts";

export const UUIDGeneratorMock: UUIDGenerator = {
  generate(): UUID {
    return crypto.randomUUID() as UUID;
  },
};
