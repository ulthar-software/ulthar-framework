import { UUID } from "../types/uuid.js";
import { UUIDGenerator } from "./uuid-generator.js";

export const UUIDGeneratorMock: UUIDGenerator = {
  generate(): UUID {
    return crypto.randomUUID() as UUID;
  },
};
