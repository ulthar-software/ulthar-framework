import type {
  Effect,
  NotFoundError,
  StoreQueryError,
  UUID,
} from "@fabric/core";
import type { DomainStateStore } from "../../services/state-store.js";
import type { User } from "../user.js";

export function getUserFromId(
  state: DomainStateStore,
  userId: UUID,
): Effect<User, StoreQueryError | NotFoundError> {
  return state
    .from("users")
    .where({
      id: userId,
    })
    .selectOneOrFail();
}
