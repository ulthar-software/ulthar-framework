import { Concept } from "./concept";
import { Module } from "./module";
import { Error } from "./error";
import { Model } from "./model";
import { Role } from "./role";

export class Interactor extends Module {
    concepts: Concept[] = [];
    throws: Error[] = [];
    roles: Role[] = [];

    constructor(public requestModel: Model, public responseModel: Model) {
        super();
    }
}
