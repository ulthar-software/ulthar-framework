import { Field, Model, type ModelToType } from "@fabric/domain";
import type { ReadStateStore } from "../services/state-store.ts";

export const UserModel = Model.aggregateFrom("users", {
  email: Field.string(),
  hashedPassword: Field.string(),
  role: Field.string(),
});
export type UserModel = typeof UserModel;
export type User = ModelToType<UserModel>;

export function findUserByEmail(stateStore: ReadStateStore, email: string) {
  return stateStore.from("users")
    .where({
      email,
    })
    .selectOneOrFail();
}
