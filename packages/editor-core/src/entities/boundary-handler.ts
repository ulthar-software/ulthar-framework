import { Model } from "./model";
import { Module } from "./module";

export class BoundaryHandler extends Module {
    constructor(public requestModel: Model, public responseModel: Model) {
        super();
    }
}
