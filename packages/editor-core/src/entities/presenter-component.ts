import { Model } from "./model";
import { Module } from "./module";

export class PresenterComponent extends Module {
    constructor(public propsModel: Model) {
        super();
    }
}
