import type { UUID } from "@fabric/core";
import type { UUIDGenerator } from "./uuid-generator.js";

export const UUIDGeneratorMock: UUIDGenerator = {
  generate(): UUID {
    return crypto.randomUUID();
  },
};
