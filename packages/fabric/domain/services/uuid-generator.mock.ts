import type { UUID } from "@fabric/core";
import type { UUIDGenerator } from "./uuid-generator.ts";

export const UUIDGeneratorMock: UUIDGenerator = {
  generate(): UUID {
    return crypto.randomUUID() as UUID;
  },
};
