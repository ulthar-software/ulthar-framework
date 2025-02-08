import { Field, Model, type ModelToType } from "@fabric/models";
import type { ReadValueStore } from "../services/state-store.ts";

export const UserModel = new Model("users", {
  email: Field.string({}),
  hashedPassword: Field.string({}),
  role: Field.string({}),
});
export type UserModel = typeof UserModel;
export type User = ModelToType<UserModel>;

export function findUserByEmail(stateStore: ReadValueStore, email: string) {
  return stateStore.from("users")
    .where({
      email,
    })
    .selectOneOrFail();
}
