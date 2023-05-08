import { Model } from "./model.js";
import { Module } from "./module.js";

export class BoundaryHandler extends Module {
    constructor(
        name: string,
        public requestModel: Model,
        public responseModel: Model
    ) {
        super(name);
    }
}
