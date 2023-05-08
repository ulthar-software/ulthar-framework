import { Model } from "./model.js";
import { Module } from "./module.js";

export class PresenterComponent extends Module {
    constructor(name: string, public propsModel: Model) {
        super(name);
    }
}
