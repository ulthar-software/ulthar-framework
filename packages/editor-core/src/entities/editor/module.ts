import { Provider } from "./provider.js";
import { Type } from "./types/type.js";

export class Module extends Type {
    dependencies: Provider[] = [];
}
