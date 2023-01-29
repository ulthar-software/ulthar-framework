import { Interactor } from "./interactor";
import { Permission } from "./permission";

export type RoleType = "person" | "system";

export class Role {
    type: RoleType = "person";
    permissions: Permission[] = [];
    interactions: Interactor[] = [];
}
