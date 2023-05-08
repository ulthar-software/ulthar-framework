import { Concept } from "./concept.js";
import { Module } from "./module.js";
import { Error } from "./error.js";
import { Model } from "./model.js";
import { Role } from "./role.js";

export class Interactor extends Module {
    concepts: Concept[] = [];
    throws: Error[] = [];
    roles: Role[] = [];

    constructor(
        name: string,
        public requestModel: Model,
        public responseModel: Model
    ) {
        super(name);
    }
}
