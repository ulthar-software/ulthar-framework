import { Model } from "./model.js";
import { Module } from "./module.js";

export class BoundaryHandler extends Module {
    constructor(public requestModel: Model, public responseModel: Model) {
        super();
    }
}
