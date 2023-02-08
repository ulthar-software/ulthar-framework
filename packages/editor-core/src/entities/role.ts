import { Interactor } from "./interactor.js";
import { Permission } from "./permission.js";

export type RoleType = "person" | "system";

export class Role {
    type: RoleType = "person";
    permissions: Permission[] = [];
    interactions: Interactor[] = [];

    constructor(public name: string) {}
}
