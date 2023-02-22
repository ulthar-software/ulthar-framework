import { Model } from "./model.js";
import { Module } from "./module.js";

export class PresenterComponent extends Module {
    constructor(public propsModel: Model) {
        super();
    }
}
